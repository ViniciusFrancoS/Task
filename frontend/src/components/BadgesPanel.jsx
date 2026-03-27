import React from 'react';

// Definição das Badges
export const BADGES_CONFIG = {
    madrugador: {
        id: 'madrugador',
        nome: 'Madrugador',
        descricao: '1ª Tarefa antes das 08:00',
        icone: '🌅',
        maxLevel: 3
    },
    maratonista: {
        id: 'maratonista',
        nome: 'Maratonista',
        descricao: 'Sequência diária mantida',
        icone: '🔥',
        maxLevel: 3
    },
    foco_total: {
        id: 'foco_total',
        nome: 'Foco Total',
        descricao: '5 tarefas sem falhas',
        icone: '🎯',
        maxLevel: 3
    },
    inimigo_procrastinacao: {
        id: 'inimigo_procrastinacao',
        nome: 'Inimigo da Procrastinação',
        descricao: 'Finalizada em < 10 mins',
        icone: '⏳',
        maxLevel: 3
    },
    mestre_ia: {
        id: 'mestre_ia',
        nome: 'Mestre da IA',
        descricao: 'Especialista em checklists',
        icone: '🧠',
        maxLevel: 3
    }
};

const TIER_CLASSES = {
    0: 'tier-locked',
    1: 'tier-bronze',
    2: 'tier-silver',
    3: 'tier-gold'
};

export default function BadgesPanel({ userBadges = {} }) {
    const badgesArray = Object.values(BADGES_CONFIG);

    return (
        <section className="badges-section">
            <h2 className="badges-title">Coleção de Conquistas</h2>
            <div className="badges-grid">
                {badgesArray.map(badge => {
                    const status = userBadges[badge.id] || { nivel: 0, progresso_atual: 0 };
                    const nivelAtual = Math.min(status.nivel || 0, 3);
                    const tierClass = TIER_CLASSES[nivelAtual];

                    return (
                        <div key={badge.id} className={`badge-card ${tierClass}`}>
                            <div className="badge-glass">
                                <span className="badge-icon">{badge.icone}</span>
                            </div>
                            <div className="badge-info">
                                <h3>{badge.nome}</h3>
                                <p>{badge.descricao}</p>
                                <span className="badge-status">
                                    {nivelAtual > 0 ? `Nível ${nivelAtual}` : 'Bloqueado'}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
