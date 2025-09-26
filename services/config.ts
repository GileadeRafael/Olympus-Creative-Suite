// services/config.ts

/**
 * =======================================================================================
 *  IMPORTANT DEPLOYMENT INFORMATION
 * =======================================================================================
 * 
 *  This file contains your Supabase URL and Anonymous Key.
 * 
 *  ARE THESE KEYS SAFE TO COMMIT TO GITHUB?
 *  - YES. The Supabase 'anon' key is designed to be public and is safe to expose in
 *    your browser-side code. It only allows access to your database according to the
 *    Row Level Security (RLS) policies you have defined. Ensure RLS is enabled.
 * 
 *  WHAT ABOUT THE GEMINI API KEY?
 *  - Your Gemini API Key is a SECRET and must be kept secure. It is correctly handled
 *    by a serverless function and should NEVER be placed in this file or any other
 *    client-side code.
 * 
 * =======================================================================================
 * 
 *  INSTRUCTIONS FOR DEPLOYMENT:
 * 
 *  1. FILL IN YOUR SUPABASE KEYS BELOW:
 *     - If you haven't already, replace the placeholder values with your actual
 *       credentials from your Supabase project dashboard.
 * 
 *  2. SET UP YOUR GEMINI API KEY IN VERCEL:
 *     - In your Vercel project dashboard, go to "Settings" > "Environment Variables".
 *     - Add a new variable:
 *       - Name: API_KEY
 *       - Value: Paste your Gemini API Key here (it starts with "AIzaSy...").
 *     - Save and redeploy. The serverless function will automatically use this key.
 * 
 *  3. COMMIT THIS FILE:
 *     - Unlike secret keys, this file MUST be committed to your repository so that
 *       Vercel can access your Supabase credentials during the build process.
 *     - If you previously added this file to .gitignore, please remove that line.
 * 
 */
export const CONFIG = {
  SUPABASE_URL: "https://nzmfromwgnbjmbhrifeg.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56bWZyb213Z25iam1iaHJpZmVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MzI1ODAsImV4cCI6MjA3NDQwODU4MH0.ba_n61ffKId6VLJ1Z6gWns3vPerJGYjpG-ZMDeDuBXA",
};
