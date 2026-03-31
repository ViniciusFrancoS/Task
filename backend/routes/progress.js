const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const auth = require('../middleware/auth');

router.use(auth);

function getHojeLocal() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Converte "YYYY-MM-DD" em Date local (sem horário)
function toDateOnly(dateStr) {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
}

// fix: DST issues (date-fns?)
function diffDays(dateA, dateB) {
    if (!dateA || !dateB) return 0;
    const a = toDateOnly(dateA);
    const b = toDateOnly(dateB);
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.round((utc1 - utc2) / 86400000);
}

// GET /api/progress — Retorna o XP e streak do usuário atual
router.get('/', async (req, res) => {
    try {
        console.log(`[GET /progress] Buscando dados para: ${req.user.id}`);
        const { data: progress, error } = await req.supabase
            .from('user_progress')
            .select('xp, streak, dias_ativos, badges')
            .eq('user_id', req.user.id)
            .maybeSingle();

        if (error) {
            console.error('[GET /progress] Erro DB:', error.message);
            throw error;
        }

        if (!progress) {
            console.warn(`[GET /progress] Registro não encontrado para ${req.user.id}. Retornando padrão.`);
            return res.json({
                xp: 0,
                streak: 0,
                dias_ativos: [],
                badges: []
            });
        }

        console.log(`[GET /progress] Sucesso: XP ${progress.xp}, Streak ${progress.streak}`);
        res.json(progress);
    } catch (err) {
        console.error('[GET /progress] Erro Fatal:', err);
        res.status(500).json({ error: 'Erro ao buscar progresso.' });
    }
});

// POST /api/progress/xp — Adiciona XP
router.post('/xp', async (req, res) => {
    const { quantidade } = req.body;

    if (!quantidade || typeof quantidade !== 'number') {
        return res.status(400).json({ error: 'Quantidade de XP inválida.' });
    }

    try {
        // Lê o atual primeiro
        const { data: current, error: curError } = await req.supabase
            .from('user_progress')
            .select('xp')
            .eq('user_id', req.user.id)
            .single();

        if (curError) throw curError;

        const novoXp = (current?.xp || 0) + quantidade;

        const { data: updated, error: upError } = await req.supabase
            .from('user_progress')
            .update({ xp: novoXp, atualizado_em: new Date().toISOString() })
            .eq('user_id', req.user.id)
            .select('xp, streak')
            .single();

        if (upError) throw upError;

        res.json(updated);
    } catch (err) {
        console.error('[POST /progress/xp]', err);
        res.status(500).json({ error: 'Erro ao adicionar XP.' });
    }
});

router.post('/check-streak', async (req, res) => {
    try {
        const { data: current, error: curError } = await req.supabase
            .from('user_progress')
            .select('streak, dias_ativos')
            .eq('user_id', req.user.id)
            .single();

        if (curError) throw curError;

        const diasAtivos = current?.dias_ativos || [];
        let seq = current?.streak || 0;
        const hojeLocal = getHojeLocal();
        const ultimoDia = diasAtivos.length > 0 ? diasAtivos[diasAtivos.length - 1] : null;

        let status = 'NEUTRAL'; // STREAK_UP, STREAK_LOST, NEUTRAL

        // Se já acessou hoje, neutro
        if (ultimoDia === hojeLocal) {
            return res.json({ status: 'NEUTRAL', streak: seq });
        }

        // Se não acessou hoje, avaliaremos
        if (ultimoDia) {
            const diff = diffDays(hojeLocal, ultimoDia); // hoje > últimoAcesso

            if (diff === 1) {
                seq += 1;
                status = 'STREAK_UP';
            } else if (diff > 1) {
                // Perdeu a ofensiva (mais de 1 dia de diferença)
                seq = 1;
                status = 'STREAK_LOST';
            }
            // diff === 0 não faz nada (já tratado acima)
        } else {
            // Primeiro acesso da vida
            seq = 1;
            status = 'STREAK_UP';
        }

        // Salva a alteração garantindo ordenação e unicidade (limitado aos últimos 30 dias)
        let novosDias = [...new Set([...diasAtivos, hojeLocal])].sort();
        if (novosDias.length > 30) {
            novosDias = novosDias.slice(-30);
        }

        const { data: updated, error: upError } = await req.supabase
            .from('user_progress')
            .update({ streak: seq, dias_ativos: novosDias })
            .eq('user_id', req.user.id)
            .select('streak')
            .single();

        if (upError) throw upError;

        res.json({ status, streak: updated.streak });
    } catch (err) {
        // TODO: add context to error log
        console.error('[POST /progress/check-streak]', err);
        res.status(500).json({ error: 'Erro ao analisar streak diário.' });
    }
});

// POST /api/progress/streak/bump — (Legado / Refatorado)
// Agora o streak é gerido acima (check-streak), 
// Endpoint legado para compatibilidade.
router.post('/streak/bump', async (req, res) => {
    const { sequence, dias_ativos } = req.body; // Vem do cliente 

    if (typeof sequence !== 'number') return res.status(400).send();

    try {
        const { data: updated, error } = await req.supabase
            .from('user_progress')
            .update({ streak: sequence, dias_ativos: dias_ativos || [] })
            .eq('user_id', req.user.id)
            .select('xp, streak, dias_ativos')
            .single();

        if (error) throw error;
        res.json(updated);
    } catch (err) {
        console.error('[POST /streak/bump]', err);
        res.status(500).json({ error: 'Erro ao atualizar streak.' });
    }
});

// GET /api/progress/leaderboard — Retorna a view de ranking global + posição do usuário
router.get('/leaderboard', async (req, res) => {
    try {
        // O leaderboard agora é uma func RPC segura
        const { data: ranking, error } = await req.supabase
            .rpc('get_leaderboard')
            .order('posicao', { ascending: true })
            .limit(100);

        if (error) throw error;

        // O usuário atual
        const me = ranking.find(u => u.user_id === req.user.id);

        res.json({ ranking, me });
    } catch (err) {
        console.error('[GET /leaderboard]', err);
        res.status(500).json({ error: 'Erro ao buscar leaderboard.' });
    }
});

module.exports = router;
