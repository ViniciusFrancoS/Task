const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const auth = require('../middleware/auth');

router.use(auth);

// TODO: move to DB
const BADGE_REWARDS = {
    madrugador: { niveis: [1, 10, 30], xp: [50, 150, 500] },
    maratonista: { niveis: [7, 15, 30], xp: [100, 300, 1000] },
    foco_total: { niveis: [1, 5, 20], xp: [100, 250, 600] },
    inimigo_procrastinacao: { niveis: [5, 25, 100], xp: [80, 200, 800] },
    mestre_ia: { niveis: [5, 20, 50], xp: [50, 150, 400] }
};

// POST /api/badges/evaluate
router.post('/evaluate', async (req, res) => {
    const { action, payload } = req.body;
    const userId = req.user.id;

    try {
        const { data: progress, error: progErr } = await req.supabase
            .from('user_progress')
            .select('badges, xp')
            .eq('user_id', userId)
            .single();

        if (progErr || !progress) return res.status(404).json({ error: 'Progresso não encontrado' });

        const badges = progress.badges || {};
        let unlocks = [];
        let totalXpGained = 0;

        // Helper para checar se subiu de nível
        const handleProgression = (badgeId, countToAdd = 1, forceValue = null) => {
            if (!badges[badgeId]) badges[badgeId] = { progresso_atual: 0, nivel: 0 };
            const currentBadge = badges[badgeId];

            if (currentBadge.nivel >= 3) return; // Nível máximo

            if (forceValue !== null) {
                currentBadge.progresso_atual = forceValue;
            } else {
                currentBadge.progresso_atual += countToAdd;
            }

            const thresholds = BADGE_REWARDS[badgeId].niveis;
            const nextLevelReq = thresholds[currentBadge.nivel];

            if (currentBadge.progresso_atual >= nextLevelReq) {
                currentBadge.nivel += 1;
                const earnedXP = BADGE_REWARDS[badgeId].xp[currentBadge.nivel - 1];
                totalXpGained += earnedXP;
                unlocks.push({ id: badgeId, nivel: currentBadge.nivel, xp: earnedXP });
            }
        };

        // Regras de Negócio
        if (action === 'task_completed') {
            const { task } = payload;

            // 1. Madrugador (Antes das 8h)
            const horaLocal = new Date().getHours();
            if (horaLocal < 8) {
                handleProgression('madrugador', 1);
            }

            // 2. Inimigo da Procrastinação (Completada em < 10 mins)
            if (task.criado_em) {
                const diffMins = (new Date() - new Date(task.criado_em)) / 60000;
                if (diffMins < 10) {
                    handleProgression('inimigo_procrastinacao', 1);
                }
            }

            // 3. Foco Total (Validar tarefas completadas hoje)
            // Lógica isolada - incrementamos progressão direta
            handleProgression('foco_total', 1);
        }

        if (action === 'streak_bumped') {
            const { sequence } = payload;
            if (sequence >= 7) handleProgression('maratonista', sequence, sequence);
        }

        if (action === 'checklist_generated') {
            handleProgression('mestre_ia', 1);
        }

        // Se nada destravou ou mudou
        if (unlocks.length === 0 && totalXpGained === 0) {
            // Apenas atualiza o badge silenciamente
            await req.supabase.from('user_progress').update({ badges }).eq('user_id', userId);
            return res.json({ unlocks: [], badges, totalXpGained: 0 });
        }

        // Se houve level up ou ganho de XP, atualiza banco atomincamente
        const novoXp = (progress.xp || 0) + totalXpGained;

        await req.supabase.from('user_progress')
            .update({ badges, xp: novoXp })
            .eq('user_id', userId);

        res.json({ unlocks, badges, totalXpGained });

    } catch (err) {
        // TODO: centralize error logging
        console.error('[POST /badges/evaluate]', err);
        res.status(500).json({ error: 'Erro ao avaliar badgets' });
    }
});

module.exports = router;
