/**
 * GamificationBar — Barra de nível, XP e streak no topo do app
 */
import { getNivel, getProgressoNivel, NIVEIS } from '../hooks/useGamification';

export default function GamificationBar({ xp, sequencia, isLoading }) {
    if (isLoading) {
        return (
            <div className="gamification-bar loading-skeleton">
                <div className="gam-level-info">
                    <div className="gam-level-badge skeleton-pulse" style={{ borderColor: '#334155' }}></div>
                    <div className="gam-level-text">
                        <div className="skeleton-line-sm"></div>
                        <div className="skeleton-line-xs"></div>
                    </div>
                </div>
                <div className="gam-progress-wrapper">
                    <div className="gam-progress-bar skeleton-pulse"></div>
                </div>
            </div>
        );
    }

    const nivel = getNivel(xp);
    const progresso = getProgressoNivel(xp);
    const proxNivel = NIVEIS.find((n) => n.nivel === nivel.nivel + 1);

    return (
        <div className="gamification-bar">
            {/* Nível e badge */}
            <div className="gam-level-info">
                <div className="gam-level-badge" style={{ borderColor: nivel.cor }}>
                    <span className="gam-level-number">{nivel.nivel}</span>
                </div>
                <div className="gam-level-text">
                    <span className="gam-level-name" style={{ color: nivel.cor }}>{nivel.nome}</span>
                    <span className="gam-xp-label">{xp} XP</span>
                </div>
            </div>

            {/* Barra de progresso */}
            <div className="gam-progress-wrapper">
                <div className="gam-progress-bar">
                    <div
                        className="gam-progress-fill"
                        style={{ width: `${progresso}%`, backgroundColor: nivel.cor }}
                    />
                </div>
                {proxNivel && (
                    <span className="gam-next-label">
                        → {proxNivel.nome} em {proxNivel.minXP - xp} XP
                    </span>
                )}
            </div>

            {/* Streak */}
            <div className="gam-streak">
                <span className="gam-streak-icon">🔥</span>
                <div className="gam-streak-info">
                    <span className="gam-streak-number">{sequencia}</span>
                    <span className="gam-streak-label">{sequencia === 1 ? 'dia' : 'dias'}</span>
                </div>
            </div>
        </div>
    );
}
