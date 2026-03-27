import { useEffect, useState } from 'react';
import { fetchWithSession } from './useSession';

export function useBadges(session, ganharXP) {
    const [userBadges, setUserBadges] = useState({});

    // Sincroniza estado local inicial
    useEffect(() => {
        if (!session?.user?.id) {
            setUserBadges({});
            return;
        }

        fetchWithSession('/api/progress')
            .then(res => res.json())
            .then(data => {
                if (data && data.badges) {
                    setUserBadges(data.badges);
                }
            })
            .catch(console.error);
    }, [session?.user?.id]); // FIX MINIMALISTA: Dependência no ID quebrará loop


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

    return { userBadges, evaluateBadge };
}
