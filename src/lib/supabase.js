import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lcgzzsdnbapnxcvjhuya.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjZ3p6c2RuYmFwbnhjdmpodXlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNDA3MTUsImV4cCI6MjA4MTgxNjcxNX0.nioR4sxlnL_YU_npz1bVkADtkWw3_WghZXYaPqInR8Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
