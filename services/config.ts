// services/config.ts

/**
 * =======================================================================================
 *  CRITICAL SECURITY INFORMATION
 * =======================================================================================
 * 
 *  This file contains your PUBLIC Supabase keys. These are safe to be exposed in the
 *  browser as long as you have enabled Row Level Security (RLS) in your Supabase project,
 *  which is the default and highly recommended.
 * 
 *  Your secret keys, especially your Gemini API Key, MUST NOT be in this file.
 *  They should be stored securely as Environment Variables in your hosting provider (Vercel).
 * 
 * =======================================================================================
 * 
 *  INSTRUCTIONS FOR DEPLOYMENT:
 * 
 *  1. FILL IN SUPABASE KEYS:
 *     - Replace the placeholder values below with your actual credentials from Supabase.
 * 
 *  2. SET UP GEMINI API KEY IN VERCEL (DO NOT ADD IT HERE):
 *     - Go to your project's dashboard on Vercel.
 *     - Navigate to "Settings" > "Environment Variables".
 *     - Add a new variable:
 *       - Name: API_KEY
 *       - Value: Paste your Gemini API Key here (it starts with "AIzaSy...").
 *     - Save the variable.
 * 
 *  3. (RECOMMENDED) ADD THIS FILE TO .gitignore: 
 *     - To avoid accidentally committing your Supabase keys if you decide to make your 
 *       repository public, it's a good practice to add this line to your `.gitignore` file:
 *       `services/config.ts`
 * 
 *  4. DEPLOY:
 *     - Deploy or redeploy your application on Vercel for the changes to take effect.
 */
export const CONFIG = {
  SUPABASE_URL: "https://nzmfromwgnbjmbhrifeg.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56bWZyb213Z25iam1iaHJpZmVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MzI1ODAsImV4cCI6MjA3NDQwODU4MH0.ba_n61ffKId6VLJ1Z6gWns3vPerJGYjpG-ZMDeDuBXA",
  // 💥 DANGER: DO NOT ADD YOUR GEMINI API KEY HERE! 
  // It is now securely handled on the server via Environment Variables.
};
