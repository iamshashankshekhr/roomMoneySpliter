import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { cacheRoomData, getCachedRoomData } from '../offline/idbOutbox';

export function useRoom(user, profile) {
  const [currentRoom, setCurrentRoom] = useState(null);
  const [userRooms, setUserRooms] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteToken, setInviteToken] = useState('');

  const loadUserRoomsAndMembers = useCallback(async (preferredRoomId = null) => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // 1. Fetch all room memberships for current user
      const { data: memberRows, error: memberErr } = await supabase
        .from('room_members')
        .select('*, rooms(*)')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (memberErr) throw memberErr;

      const validRooms = (memberRows || [])
        .map(row => row.rooms)
        .filter(Boolean);

      setUserRooms(validRooms);

      let activeRoom = null;

      if (preferredRoomId) {
        activeRoom = validRooms.find(r => r.id === preferredRoomId) || validRooms[0];
      } else if (currentRoom?.id) {
        activeRoom = validRooms.find(r => r.id === currentRoom.id) || validRooms[0];
      } else if (validRooms.length > 0) {
        activeRoom = validRooms[0];
      } else {
        // First-time user without any room: automatically create a default starter room
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
        setUserRooms([newRoom]);

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

      // 2. Load members of the active room
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
      if (currentRoom?.id) {
        const cached = await getCachedRoomData(currentRoom.id);
        if (cached?.room) setCurrentRoom(cached.room);
        if (cached?.members?.length) setMembers(cached.members);
      }
    } finally {
      setLoading(false);
    }
  }, [user, profile, currentRoom?.id]);

  useEffect(() => {
    loadUserRoomsAndMembers();
  }, [loadUserRoomsAndMembers]);

  // Realtime subscription for room members
  useEffect(() => {
    if (!currentRoom?.id) return;

    const channel = supabase
      .channel(`room_members_${currentRoom.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'room_members', filter: `room_id=eq.${currentRoom.id}` },
        () => {
          loadUserRoomsAndMembers(currentRoom.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentRoom?.id, loadUserRoomsAndMembers]);

  // Switch active room
  async function switchRoom(roomId) {
    await loadUserRoomsAndMembers(roomId);
  }

  // Create new room
  async function createNewRoom(roomName, address = '') {
    if (!user) throw new Error('You must be signed in to create a room.');
    if (!roomName.trim()) throw new Error('Room name is required.');

    const { data: newRoom, error: roomErr } = await supabase
      .from('rooms')
      .insert({
        name: roomName.trim(),
        currency: 'INR',
        created_by: user.id,
        settings: { address: address.trim() || 'Shared Living' },
      })
      .select()
      .single();

    if (roomErr) throw roomErr;

    // Add creator as admin member
    const { error: memErr } = await supabase.from('room_members').insert({
      room_id: newRoom.id,
      user_id: user.id,
      role: 'admin',
      display_name: profile?.display_name || user.email?.split('@')[0] || 'Room Admin',
      upi_id: profile?.upi_id || '',
    });

    if (memErr) throw memErr;

    setUserRooms(prev => [newRoom, ...prev]);
    setCurrentRoom(newRoom);
    await loadUserRoomsAndMembers(newRoom.id);
    return newRoom;
  }

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
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
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
  async function joinRoomByToken(token, userDisplayName = '', userUpiId = '') {
    if (!user) throw new Error('You must be signed in to join a room.');

    let targetRoomId = token;

    // Check if token matches an invitation record
    const { data: invite } = await supabase
      .from('room_invitations')
      .select('*, rooms(*)')
      .eq('token', token)
      .single();

    if (invite?.room_id) {
      targetRoomId = invite.room_id;
    }

    const name = userDisplayName || profile?.display_name || user.email?.split('@')[0] || 'New Roommate';
    const upi = userUpiId || profile?.upi_id || '';

    const { data, error } = await supabase
      .from('room_members')
      .insert({
        room_id: targetRoomId,
        user_id: user.id,
        role: 'member',
        display_name: name,
        upi_id: upi,
      })
      .select()
      .single();

    if (error && error.code !== '23505') {
      throw error;
    }

    await loadUserRoomsAndMembers(targetRoomId);
    return data;
  }

  return {
    currentRoom,
    userRooms,
    members,
    loading,
    inviteToken,
    switchRoom,
    createNewRoom,
    createInviteLink,
    joinRoomByToken,
    refreshRoom: loadUserRoomsAndMembers,
  };
}
