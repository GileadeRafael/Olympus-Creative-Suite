import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// WARNING: Hardcoding secrets is not recommended in production.
// This is a temporary measure because the user couldn't set environment variables.
const supabaseUrl = "https://nzmfromwgnbjmbhrifeg.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56bWZyb213Z25iam1iaHJpZmVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MzI1ODAsImV4cCI6MjA3NDQwODU4MH0.ba_n61ffKId6VLJ1Z6gWns3vPerJGYjpG-ZMDeDuBXA";

function initializeSupabase(): SupabaseClient | null {
  if (supabaseUrl && supabaseAnonKey) {
    try {
      return createClient(supabaseUrl, supabaseAnonKey);
    } catch (error) {
      console.error("Error creating Supabase client:", error);
      return null;
    }
  }
  console.warn("Supabase URL or Anon Key is not set.");
  return null;
}

export const supabase = initializeSupabase();
