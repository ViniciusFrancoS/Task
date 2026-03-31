import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Faltando variáveis VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: true,       // Salva sessão no localStorage automaticamente
        autoRefreshToken: true,     // Renova token antes de expirar
        detectSessionInUrl: true,   // Detecta tokens em URL (magic link, OAuth)
    },
});

