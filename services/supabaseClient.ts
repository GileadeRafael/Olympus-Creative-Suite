import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Read Supabase credentials from environment variables for security and Vercel compatibility.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function initializeSupabase(): SupabaseClient | null {
  if (supabaseUrl && supabaseAnonKey) {
    try {
      return createClient(supabaseUrl, supabaseAnonKey);
    } catch (error) {
      console.error("Error creating Supabase client:", error);
      return null;
    }
  }
  console.warn("Supabase URL or Anon Key is not set in environment variables.");
  return null;
}

export const supabase = initializeSupabase();