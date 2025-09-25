import { createClient } from '@supabase/supabase-js';
import { CONFIG } from './config';

const supabaseUrl = CONFIG.SUPABASE_URL;
const supabaseAnonKey = CONFIG.SUPABASE_ANON_KEY;

if (supabaseUrl.startsWith("COLE_SUA") || supabaseAnonKey.startsWith("COLE_SUA") || !supabaseUrl || !supabaseAnonKey) {
    const errorMessage = "Credenciais da Supabase não configuradas. Por favor, edite o arquivo 'services/config.ts' e adicione sua URL e Chave Anon da Supabase.";
    console.error(errorMessage);
    // Also display it on the screen for better visibility
    document.body.innerHTML = `<div style="padding: 2rem; font-family: sans-serif; color: #ffcccc; background: #330000; height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center;"><div><h1>Erro de Configuração</h1><p>${errorMessage}</p></div></div>`;
    throw new Error(errorMessage);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
