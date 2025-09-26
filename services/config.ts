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
 *  INSTRUCTIONS:
 *  1. Replace "COLE_SUA_SUPABASE_URL_AQUI" with your Supabase project URL.
 *  2. Replace "COLE_SUA_CHAVE_ANON_SUPABASE_AQUI" with your Supabase "anon" (public) key.
 *  3. Replace "COLE_SUA_CHAVE_API_GEMINI_AQUI" with your Gemini API Key.
 */
export const CONFIG = {
  SUPABASE_URL: "COLE_SUA_SUPABASE_URL_AQUI",
  SUPABASE_ANON_KEY: "COLE_SUA_CHAVE_ANON_SUPABASE_AQUI",
  API_KEY: "COLE_SUA_CHAVE_API_GEMINI_AQUI",
};
