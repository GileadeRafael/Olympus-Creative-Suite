// services/config.ts

/**
 * =======================================================================================
 *  CRITICAL SECURITY WARNING
 * =======================================================================================
 * 
 *  This file contains sensitive API keys. This method is a temporary workaround for
 *  an environment without a standard build process.
 * 
 *  DO NOT AT ANY TIME COMMIT THIS FILE WITH REAL KEYS TO A PUBLIC REPOSITORY (LIKE GITHUB).
 * 
 *  Doing so will expose your credentials to the public, potentially leading to abuse
 *  and unexpected charges on your accounts. Anyone on the internet can find your keys
 *  and use them.
 * 
 *  For a production-ready application, you MUST use a secure method for handling
 *  secrets, such as environment variables provided by your hosting platform (e.g., Vercel),
 *  which requires a project setup with a build tool (like Vite, Next.js, etc.).
 * 
 * =======================================================================================
 * 
 *  INSTRUCTIONS FOR DEPLOYMENT:
 *  1. FILL IN YOUR KEYS: Replace the placeholder values below with your actual credentials
 *     from Supabase and Google AI Studio.
 * 
 *  2. (CRITICAL FOR SECURITY) ADD TO .gitignore: If you are using Git (e.g., with GitHub),
 *     create a file named `.gitignore` in the root of your project (if it doesn't exist)
 *     and add the following line to it:
 *     `services/config.ts`
 *     This will prevent you from accidentally publishing your secret keys.
 * 
 *  3. DEPLOY: Now you can deploy your application to Vercel.
 */
export const CONFIG = {
  SUPABASE_URL: "https://nzmfromwgnbjmbhrifeg.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56bWZyb213Z25iam1iaHJpZmVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MzI1ODAsImV4cCI6MjA3NDQwODU4MH0.ba_n61ffKId6VLJ1Z6gWns3vPerJGYjpG-ZMDeDuBXA",
  API_KEY: "AIzaSyDE2gM_c3uqH7B7d1nhircQQZ2RIPhdx3c",
};