import { createClient } from '@supabase/supabase-js';
import { CONFIG } from './config';

const supabaseUrl = CONFIG.SUPABASE_URL;
const supabaseAnonKey = CONFIG.SUPABASE_ANON_KEY;

if (supabaseUrl.startsWith("COLE_SUA") || supabaseAnonKey.startsWith("COLE_SUA") || !supabaseUrl || !supabaseAnonKey) {
    const errorMessage = "Credenciais da Supabase não configuradas. Por favor, edite o arquivo 'services/config.ts' e adicione sua URL e Chave Anon da Supabase. O aplicativo não pode iniciar sem elas.";
    console.error(errorMessage);
    // Throwing an error stops the app from running incorrectly without keys.
    // The details will be visible in the browser's developer console.
    throw new Error(errorMessage);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);