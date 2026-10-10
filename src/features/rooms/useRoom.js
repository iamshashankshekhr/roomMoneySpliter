import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { cacheRoomData, getCachedRoomData } from '../offline/idbOutbox';

export function useRoom(user, profile) {
  const [currentRoom, setCurrentRoom] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteToken, setInviteToken] = useState('');

  const loadRoom = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // 1. Fetch user's room memberships
      const { data: memberRows, error: memberErr } = await supabase
        .from('room_members')
        .select('*, rooms(*)')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (memberErr) throw memberErr;

      let activeRoom = null;

      if (memberRows && memberRows.length > 0) {
        activeRoom = memberRows[0].rooms;
      } else {
        // First-time user: automatically create a default starter room for them
        const { data: newRoom, error: roomErr } = await supabase
          .from('rooms')
          .insert({
            name: 'Flat 402 — Green Glen',
            currency: 'INR',
            created_by: user.id,
            settings: { address: 'Bellandur, BLR' },
          })
          .select()
          .single();

        if (roomErr) throw roomErr;
        activeRoom = newRoom;

        // Add user as admin member
        await supabase.from('room_members').insert({
          room_id: newRoom.id,
          user_id: user.id,
          role: 'admin',
          display_name: profile?.display_name || user.email?.split('@')[0] || 'Room Admin',
          upi_id: profile?.upi_id || '',
        });
      }

      setCurrentRoom(activeRoom);

      // 2. Load all members of this active room
      if (activeRoom) {
        const { data: allMembers, error: allMemErr } = await supabase
          .from('room_members')
          .select('*')
          .eq('room_id', activeRoom.id)
          .eq('status', 'active')
          .order('joined_at', { ascending: true });

        if (!allMemErr && allMembers) {
          setMembers(allMembers);
          // Cache locally in IndexedDB
          await cacheRoomData({ room: activeRoom, members: allMembers });
        }
      }
    } catch (err) {
      console.warn('Network load failed, reading from IndexedDB cache:', err);
      // Fallback to offline cache
      if (currentRoom?.id) {
        const cached = await getCachedRoomData(currentRoom.id);
        if (cached?.room) setCurrentRoom(cached.room);
        if (cached?.members?.length) setMembers(cached.members);
      }
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  useEffect(() => {
    loadRoom();
  }, [loadRoom]);

  // Realtime subscription for room members
  useEffect(() => {
    if (!currentRoom?.id) return;

    const channel = supabase
      .channel(`room_members_${currentRoom.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'room_members', filter: `room_id=eq.${currentRoom.id}` },
        () => {
          loadRoom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentRoom?.id, loadRoom]);

  // Generate or retrieve room invitation link
  async function createInviteLink() {
    if (!currentRoom?.id || !user) return '';
    try {
      const token = `rs_${Math.random().toString(36).substr(2, 9)}`;
      const { data, error } = await supabase
        .from('room_invitations')
        .insert({
          room_id: currentRoom.id,
          token,
          created_by: user.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          usage_limit: 20,
        })
        .select()
        .single();

      if (!error && data) {
        const fullLink = `${window.location.origin}?join=${data.token}`;
        setInviteToken(fullLink);
        return fullLink;
      }
    } catch (err) {
      console.error('Failed to create invitation:', err);
    }
    const fallbackLink = `${window.location.origin}?join=${currentRoom.id}`;
    setInviteToken(fallbackLink);
    return fallbackLink;
  }

  // Join a room by token or ID
  async function joinRoomByToken(token, userDisplayName = 'New Roommate', userUpiId = '') {
    if (!user) throw new Error('You must be signed in to join a room.');

    // 1. Try finding by invitation token
    const { data: invite, error: inviteErr } = await supabase
      .from('room_invitations')
      .select('*, rooms(*)')
      .eq('token', token)
      .single();

    let targetRoomId = null;
    if (!inviteErr && invite?.room_id) {
      targetRoomId = invite.room_id;
    } else {
      targetRoomId = token; // Direct room ID fallback
    }

    // 2. Add as room member
    const { data, error } = await supabase
      .from('room_members')
      .insert({
        room_id: targetRoomId,
        user_id: user.id,
        role: 'member',
        display_name: userDisplayName,
        upi_id: userUpiId,
      })
      .select()
      .single();

    if (error && error.code !== '23505') { // Ignore unique constraint if already member
      throw error;
    }

    await loadRoom();
    return data;
  }

  // Create new room
  async function createNewRoom(roomName, address = '') {
    if (!user) return;
    const { data: newRoom, error } = await supabase
      .from('rooms')
      .insert({
        name: roomName,
        currency: 'INR',
        created_by: user.id,
        settings: { address },
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from('room_members').insert({
      room_id: newRoom.id,
      user_id: user.id,
      role: 'admin',
      display_name: profile?.display_name || 'Admin',
      upi_id: profile?.upi_id || '',
    });

    setCurrentRoom(newRoom);
    await loadRoom();
    return newRoom;
  }

  return {
    currentRoom,
    members,
    loading,
    inviteToken,
    createInviteLink,
    joinRoomByToken,
    createNewRoom,
    refreshRoom: loadRoom,
  };
}
