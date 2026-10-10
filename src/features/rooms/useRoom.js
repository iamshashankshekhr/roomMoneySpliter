import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { cacheRoomData, getCachedRoomData } from '../offline/idbOutbox';

export function useRoom(user, profile) {
  const [currentRoom, setCurrentRoom] = useState(null);
  const [userRooms, setUserRooms] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteToken, setInviteToken] = useState('');

  const currentRoomIdRef = useRef(null);

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
      const targetId = preferredRoomId || currentRoomIdRef.current;

      if (targetId) {
        activeRoom = validRooms.find(r => r.id === targetId) || validRooms[0] || null;
      } else if (validRooms.length > 0) {
        activeRoom = validRooms[0];
      } else {
        // User has not created or joined any room yet: do NOT insert fake rooms
        activeRoom = null;
        setMembers([]);
      }

      currentRoomIdRef.current = activeRoom?.id || null;
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
      const activeId = currentRoomIdRef.current;
      if (activeId) {
        const cached = await getCachedRoomData(activeId);
        if (cached?.room) setCurrentRoom(cached.room);
        if (cached?.members?.length) setMembers(cached.members);
      }
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

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
    currentRoomIdRef.current = roomId;
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

    currentRoomIdRef.current = newRoom.id;
    setCurrentRoom(newRoom);
    setUserRooms(prev => [newRoom, ...prev]);
    await loadUserRoomsAndMembers(newRoom.id);
    return newRoom;
  }

  // Rename room & update settings
  async function renameRoom(roomId, newName, newAddress = '') {
    if (!user) throw new Error('You must be signed in to rename a room.');
    if (!newName.trim()) throw new Error('Room name cannot be empty.');

    const { data, error } = await supabase
      .from('rooms')
      .update({
        name: newName.trim(),
        settings: { address: newAddress.trim() },
        updated_at: new Date().toISOString(),
      })
      .eq('id', roomId)
      .select()
      .single();

    if (error) throw error;

    setUserRooms(prev => prev.map(r => (r.id === roomId ? data : r)));
    if (currentRoom?.id === roomId) {
      setCurrentRoom(data);
    }
    return data;
  }

  // Delete room permanently
  async function deleteRoom(roomId) {
    if (!user) throw new Error('You must be signed in to delete a room.');

    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', roomId);

    if (error) throw error;

    const remainingRooms = userRooms.filter(r => r.id !== roomId);
    setUserRooms(remainingRooms);

    const nextRoomId = remainingRooms[0]?.id || null;
    currentRoomIdRef.current = nextRoomId;
    await loadUserRoomsAndMembers(nextRoomId);
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

    currentRoomIdRef.current = targetRoomId;
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
    renameRoom,
    deleteRoom,
    createInviteLink,
    joinRoomByToken,
    refreshRoom: loadUserRoomsAndMembers,
  };
}
