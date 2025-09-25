import { createClient } from '@supabase/supabase-js';

// For Vercel deployment, these variables are set in the project settings.
// For local development, we fall back to hardcoded values.
// Standardize on `process.env` as `import.meta.env` is not available in this environment.
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nzmfromwgnbjmbhrifeg.supabase.co';

// NOTE FOR DEVELOPER:
// The key below is a fallback for local development. For production, set VITE_SUPABASE_ANON_KEY in Vercel.
// This key is safe to be public in a browser environment.
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56bWZyb213Z25iam1iaHJpZmVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MzI1ODAsImV4cCI6MjA3NDQwODU4MH0.ba_n61ffKId6VLJGYjpG-ZMDeDuBXA';

if (!supabaseUrl || !supabaseAnonKey) {
    // Log an error to the console but don't throw, to prevent the app from crashing.
    // The Supabase client will fail on API calls if the credentials are wrong, which is handled in the UI.
    console.error("Supabase credentials missing. App will likely fail. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.");
}

// Initialize the client. It will only throw here if the URL is malformed.
// If the key is wrong, subsequent auth/db calls will fail, which is handled by the UI (e.g., AuthScreen error messages).
export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);