const supabase = require('../supabase');
const { createClient } = require('@supabase/supabase-js');

/**
 * Middleware para validar o JWT (Authorization: Bearer <token>) e injetar req.user
 * Implementa Lazy Init para a tabela user_progress caso seja a primeira vez do usuário.
 */
async function requireAuth(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token de autenticação ausente ou inválido.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // [DEBUG] Iniciando validação de token
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            
            return res.status(401).json({ error: 'Não autorizado. Token inválido/expirado.' });
        }

        

        // [REMOVIDO] Bloqueio de e-mail não verificado para portfólio
        /* 
        if (!user.email_confirmed_at) {
            
            return res.status(403).json({ 
                error: 'E-mail não confirmado.', 
                code: 'EMAIL_NOT_CONFIRMED',
                message: 'Por favor, confirme seu e-mail para acessar os recursos da TaskForge.' 
            });
        }
        */

        // Criar cliente escopado para o usuário
        req.supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
            global: { headers: { Authorization: `Bearer ${token}` } }
        });

        // Lazy Init: Garantir que existe progresso para esse usuário
        // Só roda se o usuário estiver verificado (que já garantimos acima)
        const { data: progress, error: pgError } = await req.supabase
            .from('user_progress')
            .select('xp')
            .eq('user_id', user.id)
            .maybeSingle();

        if (pgError) {
            
        }

        if (!progress) {
            
            // Cria progresso base com nome (se disponível)
            const userName = user.user_metadata?.full_name || user.email.split('@')[0];
            
            const { error: insertError } = await req.supabase.from('user_progress').insert({
                user_id: user.id,
                name: userName,
                xp: 0,
                streak: 0,
                dias_ativos: []
            });

            if (insertError) {
                
            } else {
                
            }
        }

        // Anexar propriedades do usuário
        req.user = {
            id: user.id,
            email: user.email
        };

        next();
    } catch (err) {
        
        return res.status(500).json({ error: 'Erro interno na validação de usuário.' });
    }
}

module.exports = requireAuth;
