import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const SESSION_START_KEY = 'rs_session_login_time';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get initial active session with 7-day expiration check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const loginTime = localStorage.getItem(SESSION_START_KEY);
        const now = Date.now();

        if (loginTime && (now - Number(loginTime) > SESSION_MAX_AGE_MS)) {
          console.log('User login session expired after 7 days. Signing out...');
          localStorage.removeItem(SESSION_START_KEY);
          await supabase.auth.signOut();
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        if (!loginTime) {
          localStorage.setItem(SESSION_START_KEY, now.toString());
        }

        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        localStorage.removeItem(SESSION_START_KEY);
        setUser(null);
        setLoading(false);
      }
    });

    // 2. Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      if (currentUser) {
        const loginTime = localStorage.getItem(SESSION_START_KEY);
        const now = Date.now();

        if (loginTime && (now - Number(loginTime) > SESSION_MAX_AGE_MS)) {
          console.log('User login session expired after 7 days. Signing out...');
          localStorage.removeItem(SESSION_START_KEY);
          await supabase.auth.signOut();
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        if (event === 'SIGNED_IN' || !loginTime) {
          localStorage.setItem(SESSION_START_KEY, now.toString());
        }

        setUser(currentUser);
        fetchProfile(currentUser.id);
      } else {
        localStorage.removeItem(SESSION_START_KEY);
        setUser(null);
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

  // 1. Sign in with Email & Password
  async function signInWithPassword(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw error;
    setUser(data.user);
    if (data.user) {
      await fetchProfile(data.user.id);
    }
    return data;
  }

  // 2. Sign up with Email & Password
  async function signUpWithPassword(email, password, displayName = '', upiId = '') {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          display_name: displayName.trim(),
          upi_id: upiId.trim(),
        },
      },
    });
    if (error) throw error;
    setUser(data.user);
    if (data.user) {
      await fetchProfile(data.user.id);
    }
    return data;
  }

  // 3. Sign in with OTP / Magic Link
  async function signInWithOtp(email, displayName = '', upiId = '') {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        data: {
          display_name: displayName.trim(),
          upi_id: upiId.trim(),
        },
      },
    });
    if (error) throw error;
  }

  // 4. Verify OTP
  async function verifyOtp(email, token) {
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: token.trim(),
      type: 'email',
    });
    if (error) throw error;
    setUser(data.user);
    if (data.user) {
      await fetchProfile(data.user.id);
    }
    return data;
  }

  // 5. Update user profile
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

  // 6. Sign in with Google OAuth
  async function signInWithGoogle() {
    const redirectUrl =
      import.meta.env.VITE_APP_URL ||
      window.location.origin;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;

    if (data?.url) {
      try {
        const check = await fetch(data.url, { method: 'GET', redirect: 'manual' });
        if (check.status === 400) {
          const body = await check.json().catch(() => ({}));
          if (body?.msg?.includes('provider is not enabled') || body?.error_code === 'validation_failed') {
            throw new Error(
              'Google Sign-In is not enabled in your Supabase project yet. Please enable it in the Supabase Dashboard under Authentication → Providers → Google (with your Google Client ID & Secret).'
            );
          }
        }
      } catch (checkErr) {
        if (checkErr.message?.includes('Google Sign-In is not enabled')) {
          throw checkErr;
        }
      }

      window.location.href = data.url;
    }
    return data;
  }

  // 7. Sign out
  async function signOut() {
    localStorage.removeItem(SESSION_START_KEY);
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  return {
    user,
    profile,
    loading,
    signInWithPassword,
    signUpWithPassword,
    signInWithGoogle,
    signInWithOtp,
    verifyOtp,
    updateProfile,
    signOut,
  };
}
