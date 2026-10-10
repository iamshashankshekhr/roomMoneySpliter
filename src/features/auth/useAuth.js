import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data);
      }
    } catch (err) {
      console.warn('Could not load user profile:', err);
    } finally {
      setLoading(false);
    }
  }

  async function signInWithOtp(email, displayName = '', upiId = '') {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: {
          display_name: displayName,
          upi_id: upiId,
        },
      },
    });
    if (error) throw error;
  }

  async function verifyOtp(email, token) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
    if (error) throw error;
    return data;
  }

  async function updateProfile({ displayName, upiId }) {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName,
        upi_id: upiId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) throw error;
    setProfile(prev => ({ ...prev, display_name: displayName, upi_id: upiId }));
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return {
    user,
    profile,
    loading,
    signInWithOtp,
    verifyOtp,
    updateProfile,
    signOut,
  };
}
