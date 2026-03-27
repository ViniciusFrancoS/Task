import { supabase } from '../lib/supabase';

// Cache de token em nível de módulo — atualizado pelo listener abaixo
let _cachedToken = null;
let _listenerRegistered = false; // Garante registro único mesmo em HMR (Vite dev)

if (!_listenerRegistered) {
    _listenerRegistered = true;
    supabase.auth.onAuthStateChange((_, session) => {
        // Explícito: limpa o cache no logout, seta no login
        _cachedToken = session?.access_token ?? null;
    });
}


/**
 * Função global para fetch autenticado.
 * Busca a sessão atual do Supabase (que resolve refresh se necessário).
 */
export async function fetchWithSession(url, options = {}) {
    // getSession() é assíncrono e resolve a sessão atual, fazendo o refresh se autoRefreshToken estiver on
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || null;

    const headers = new Headers(options.headers || {});
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    // Determina a base URL
    let finalUrl = url;
    if (url.startsWith('/api')) {
        const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, ''); 
        const endpoint = url.startsWith('/') ? url : `/${url}`;
        finalUrl = `${baseUrl}${endpoint}`;
    }

    const response = await fetch(finalUrl, { ...options, headers });

    // Se recebermos 401, a sessão pode estar realmente inválida
    if (response.status === 401) {
        console.warn('[fetchWithSession] 401 Detectado. Token pode ter expirado ou ser inválido.');
        // Opcional: emitir evento ou limpar sessão se necessário
    }

    return response;
}
