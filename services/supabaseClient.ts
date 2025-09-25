import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

function initializeSupabase(): SupabaseClient | null {
  if (supabaseUrl && supabaseAnonKey) {
    try {
      return createClient(supabaseUrl, supabaseAnonKey);
    } catch (error) {
      console.error("Error creating Supabase client:", error);
      return null;
    }
  }
  console.warn("Supabase URL or Anon Key is not set in environment variables. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your project's Secrets.");
  return null;
}

export const supabase = initializeSupabase();
