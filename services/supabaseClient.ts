import { createClient } from '@supabase/supabase-js';

// Environment variables are exposed on `process.env`.
// FIX: Switched from import.meta.env to process.env to fix TypeScript errors
// and maintain consistency with other services.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    // This error is critical for developers. The app cannot function without these keys.
    // We throw an error to make the configuration issue immediately obvious and prevent
    // the app from getting stuck in a loading state with a cryptic error.
    throw new Error("Supabase credentials missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.");
}

// Initialize the client. If the keys are invalid, subsequent API calls will fail,
// which is handled by the UI (e.g., AuthScreen error messages).
export const supabase = createClient(supabaseUrl, supabaseAnonKey);