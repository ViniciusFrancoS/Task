/**
 * Leaderboard — Ranking local com usuários simulados
 * Top 3 em destaque, jogador atual destacado com borda
 */
import { useLeaderboard } from './useLeaderboard';

const MEDALS = ['🥇', '🥈', '🥉'];

function getRankClass(posicao, isPlayer) {
    if (isPlayer) return 'lb-row player';
    if (posicao <= 3) return `lb-row top${posicao}`;
    return 'lb-row';
}

export default function Leaderboard({ xp, sequencia, userId }) {
    const { ranking = [], posicaoPlayer = '-', loading } = useLeaderboard(xp, sequencia, userId);

    if (loading && ranking.length === 0) {
        return (
            <div className="leaderboard skeleton-loading">
                <div className="lb-header">
                    <div className="skeleton-title"></div>
                </div>
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="lb-row skeleton">
                        <div className="skeleton-circle"></div>
                        <div className="skeleton-line"></div>
                        <div className="skeleton-line small"></div>
                    </div>
                ))}
            </div>
        );
    }


    const safeRanking = Array.isArray(ranking) ? ranking : [];
    const top10 = safeRanking.slice(0, 10);
    const playerInTop10 = top10.some((u) => u?.isPlayer);
    const playerEntry = safeRanking.find((u) => u?.isPlayer) || { id: 'fallback', nome: 'Você', xp: xp, streak: sequencia, posicao: posicaoPlayer, isPlayer: true };
    const displayList = playerInTop10 ? top10 : [...top10.slice(0, 9), playerEntry];

    return (
        <div className="leaderboard">
            <div className="lb-header">
                <h2 className="lb-title">🏆 Ranking</h2>
                <span className="lb-your-pos">Sua posição: <strong>#{posicaoPlayer}</strong></span>
            </div>

            <div className="lb-list">
                {displayList.map((user) => (
                    <div key={user.id} className={getRankClass(user.posicao, user.isPlayer)}>
                        {/* Posição */}
                        <span className="lb-pos">
                            {user.posicao <= 3 ? MEDALS[user.posicao - 1] : `#${user.posicao}`}
                        </span>

                        {/* Nome */}
                        <span className="lb-name">
                            {user.nome}
                            {user.isPlayer && <span className="lb-you-tag">você</span>}
                        </span>

                        {/* XP + streak */}
                        <div className="lb-stats">
                            {user.streak > 0 && (
                                <span className="lb-streak">🔥 {user.streak}</span>
                            )}
                            <span className="lb-xp">{user.xp} XP</span>
                        </div>
                    </div>
                ))}
            </div>

            {!playerInTop10 && (
                <div className="lb-separator">
                    <span>···</span>
                </div>
            )}
        </div>
    );
}
