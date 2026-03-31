import { useMemo, useState, useEffect } from 'react';
import { fetchWithSession } from '../../core/auth/useSession';

const NOMES_FICTICIOS = [
    'Lucas M.', 'Ana P.', 'Gabriel S.', 'Beatriz L.', 'Rafael T.',
    'Camila F.', 'Mateus O.', 'Larissa N.', 'Felipe R.', 'Julia C.',
    'Pedro H.', 'Isabela V.', 'Thiago A.', 'Fernanda G.', 'Gustavo B.',
];

function seededRandom(seed) {
    let s = seed;
    return function () {
        s = (s * 16807 + 0) % 2147483647;
        return (s - 1) / 2147483646;
    };
}

function gerarUsuariosFicticios(count = 12) {
    const rng = seededRandom(42);
    return NOMES_FICTICIOS.slice(0, count).map((nome, i) => ({
        id: `bot-${i}`,
        nome,
        xp: Math.floor(50 + rng() * 450),
        streak: Math.floor(rng() * 14),
        isPlayer: false,
    }));
}

export function useLeaderboard(xpReal, streakReal, userId) {
    const [ranking, setRanking] = useState(() => {
        // Tenta carregar do cache para evitar flicker ao trocar de aba
        const saved = localStorage.getItem('ag_leaderboard_cache');
        return saved ? JSON.parse(saved) : [];
    });
    const [posicaoPlayer, setPosicaoPlayer] = useState('-');
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        setLoading(true);
        fetchWithSession('/api/progress/leaderboard')
            .then(r => r.json())
            .then(data => {
                if (data.ranking) {
                    const formated = data.ranking.map(u => {
                        const isMe = u.user_id === data.me?.user_id;
                        return {
                            id: u.user_id,
                            nome: isMe ? 'Você' : (u.name || 'Membro TaskForge'),
                            xp: u.xp,
                            streak: u.streak,
                            posicao: u.posicao,
                            isPlayer: isMe
                        };
                    });

                    let finalRanking = [];
                    let finalPos = data.me?.posicao || '-';

                    // Se não tiver volume no banco, mescla bot pra ficar bonito o MVP
                    if (formated.length < 5) {
                        const ficticios = gerarUsuariosFicticios(12 - formated.length);
                        finalRanking = [...formated, ...ficticios]
                            .sort((a, b) => b.xp - a.xp)
                            .map((u, i) => ({ ...u, posicao: i + 1 }));
                        finalPos = finalRanking.find(x => x.isPlayer)?.posicao || '-';
                    } else {
                        finalRanking = formated;
                    }

                    setRanking(finalRanking);
                    setPosicaoPlayer(finalPos);
                    localStorage.setItem('ag_leaderboard_cache', JSON.stringify(finalRanking));
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [userId]); // Recarrega apenas quando o usuário mudar (login/logout)


    // Se estiver carregando, mostra o fallback do memo
    const fallback = useMemo(() => {
        const ficticios = gerarUsuariosFicticios(12);
        const player = {
            id: 'player_fallback', nome: 'Você', xp: xpReal, streak: streakReal, isPlayer: true
        };
        return [...ficticios, player]
            .sort((a, b) => b.xp - a.xp)
            .map((u, idx) => ({ ...u, posicao: idx + 1 }));
    }, [xpReal, streakReal]);

    return { ranking, posicaoPlayer, loading };
}
