import { useLocalStorage } from '../../shared/hooks/useLocalStorage';
import { useState, useCallback, useEffect } from 'react';
import { fetchWithSession } from '../../core/auth/useSession';

const BASE_NAMES = [
    'Iniciante', 'Focado', 'Consistente', 'Disciplinado', 'Mestre',
    'Grão-Mestre', 'Lendário', 'Mítico', 'Titã', 'Supremo'
];
const COLORS = ['#6366f1', '#a855f7', '#f59e0b', '#22c55e', '#ec4899', '#f43f5e', '#8b5cf6', '#0ea5e9', '#10b981', '#fcd34d'];

// Gera até 100 níveis dinamicamente protegendo a progressão inicial contra downgrades
export const NIVEIS = (() => {
    const list = [];
    for (let i = 1; i <= 100; i++) {
        let min = 0;
        if (i === 1) min = 0;
        else if (i === 2) min = 51;
        else if (i === 3) min = 151;
        else if (i === 4) min = 301;
        else if (i === 5) min = 501;
        else {
            // XP progressivo: O custo para o Nível K é o MIN do K-1 + fórmula
            const custo = Math.floor(100 * Math.pow(i - 1, 1.5));
            min = list[i - 2].minXP + custo;
        }

        const nomeDoNivel = i <= 10 ? BASE_NAMES[i - 1] : `Transcendente I${'I'.repeat(Math.min(3, i - 11))}`;
        
        list.push({
            nivel: i,
            nome: nomeDoNivel,
            minXP: min,
            maxXP: Infinity,
            cor: COLORS[(i - 1) % COLORS.length]
        });

        if (i > 1) {
            list[i - 2].maxXP = min - 1;
        }
    }
    return list;
})();

export const XP_TABELA = {
    checklistItem: 5,
    iniciarTarefa: 10,
    concluirTarefa: 20,
};

// Função para pegar a data real local no formato YYYY-MM-DD, evitando fuso horário (UTC)
function getHojeLocal() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getNivel(xp) {
    return NIVEIS.findLast((n) => xp >= n.minXP) || NIVEIS[0];
}

export function getProgressoNivel(xp) {
    const nivel = getNivel(xp);
    if (nivel.maxXP === Infinity) return 100;
    const range = nivel.maxXP - nivel.minXP;
    const progresso = xp - nivel.minXP;
    return Math.min(100, Math.round((progresso / range) * 100));
}

export function useGamification(session) {
    const [dados, setDados] = useLocalStorage('ag_gamification', {
        diasAtivos: [],
    });

    const [xp, setXp] = useState(0);
    const [streak, setStreak] = useState(0);
    const [streakStatus, setStreakStatus] = useState(null);
    const [toasts, setToasts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Busca valor real do banco
    useEffect(() => {
        if (!session?.user?.id) {
            console.log('[useGamification] Sem sessão ativa. Resetando valores.');
            setXp(0);
            setStreak(0);
            setIsLoading(false);
            return;
        }

        console.log(`[useGamification] Iniciando fetch para: ${session.user.email}`);
        setIsLoading(true);

        fetchWithSession('/api/progress')
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(data => {
                console.log('[useGamification] Dados recebidos:', data);
                if (data && typeof data.xp === 'number') {
                    setXp(data.xp);
                    setStreak(data.streak);
                    // Puxa o array do banco e o número atual do streak
                    setDados({ 
                        diasAtivos: data.dias_ativos || [],
                        sequencia: data.streak || 0
                    });

                    // Após carregar o básico, verifica se deve disparar o check-streak diário
                    const alreadyChecked = sessionStorage.getItem(`ag_streak_check_${session.user.id}`);
                    if (!alreadyChecked) {
                        console.log('[useGamification] Disparando check-streak diário...');
                        fetchWithSession('/api/progress/check-streak', { method: 'POST' })
                            .then(r => r.json())
                            .then(streakData => {
                                console.log('[useGamification] Resultado check-streak:', streakData);
                                if (streakData.status && streakData.status !== 'NEUTRAL') {
                                    setStreakStatus(streakData.status);
                                    setStreak(streakData.streak); // Atualiza imediatamente o contador na UI
                                }
                                sessionStorage.setItem(`ag_streak_check_${session.user.id}`, 'true');
                            })
                            .catch(err => console.error('[useGamification] Streak Check Error:', err));
                    }
                }
            })
            .catch(err => {
                console.error('[useGamification] Erro ao carregar progresso:', err);
                // Fallback para valores locais se a API falhar para não travar a UI
                setXp(0); 
                setStreak(0);
            })
            .finally(() => {
                console.log('[useGamification] Fetch finalizado.');
                setIsLoading(false);
            });
    }, [session?.user?.id]);


    function mostrarToast(quantidade, label = '') {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, quantidade, label }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 1800);
    }

    const ganharXP = useCallback((quantidade, label = '') => {
        mostrarToast(quantidade, label);
        setXp(prev => prev + quantidade);

        // Envia infos pro Supabase persistir
        fetchWithSession('/api/progress/xp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantidade })
        })
        .then(r => r.json())
        .then(data => {
            if (data && typeof data.xp === 'number') {
                setXp(data.xp);
                setStreak(data.streak);
            }
        })
        .catch(console.error);
    }, []);

    const nivelAtual = getNivel(xp);
    const progresso = getProgressoNivel(xp);

    return {
        xp,
        nivelAtual,
        progresso,
        sequencia: streak,
        streakStatus,
        clearStreakStatus: () => setStreakStatus(null),
        toasts,
        ganharXP,
        isLoading,
    };
}
