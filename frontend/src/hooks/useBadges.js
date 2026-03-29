import { useEffect, useState } from 'react';
import { fetchWithSession } from './useSession';

export function useBadges(session, ganharXP) {
    const [userBadges, setUserBadges] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // Sincroniza estado local inicial
    useEffect(() => {
        if (!session?.user?.id) {
            console.log('[useBadges] Sem sessão ativa. Resetando badges.');
            setUserBadges({});
            setIsLoading(false);
            return;
        }

        console.log(`[useBadges] Iniciando fetch para: ${session.user.email}`);
        setIsLoading(true);

        fetchWithSession('/api/progress')
            .then(res => res.json())
            .then(data => {
                console.log('[useBadges] Badges recebidas:', data?.badges);
                if (data && data.badges) {
                    setUserBadges(data.badges);
                }
            })
            .catch(err => {
                console.error('[useBadges] Erro ao carregar badges:', err);
            })
            .finally(() => {
                console.log('[useBadges] Fetch de badges finalizado.');
                setIsLoading(false);
            });
    }, [session?.user?.id]);


    // Função central para despachar uma ação
    const evaluateBadge = async (action, payload = {}) => {
        if (!session) return;

        try {
            const res = await fetchWithSession('/api/badges/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, payload })
            });

            if (!res.ok) return;
            const data = await res.json();

            // Atualiza estado local com as badges modificadas (somente o que o backend validar)
            if (data.badges) {
                setUserBadges(data.badges);
            }

            // Exibe a conquista visual
            if (data.unlocks && data.unlocks.length > 0) {
                data.unlocks.forEach(unlock => {
                    // Pega o nome amigável local se quiser, mas aqui temos a ID.
                    const tierName = unlock.nivel === 3 ? 'OURO' : unlock.nivel === 2 ? 'PRATA' : 'BRONZE';
                    // Reutiliza o Toast de XP que já existe!
                    ganharXP(unlock.xp, `Conquista Desbloqueada: ${unlock.id.toUpperCase()} [${tierName}]`);
                });
            }

        } catch (err) {
            console.error('Erro na gamificação de badges:', err);
        }
    };

    return { userBadges, evaluateBadge, isLoading };
}
