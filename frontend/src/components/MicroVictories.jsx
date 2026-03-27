/**
 * MicroVictories — Painel de micro-vitórias do dia
 * Mostra tarefas iniciadas, concluídas e sequência de dias
 */
export default function MicroVictories({ iniciadas, concluidas, sequencia }) {
    const estaAtivo = iniciadas > 0 || concluidas > 0;

    return (
        <div className={`micro-victories ${estaAtivo ? 'active' : ''}`}>
            <div className="mv-item">
                <span className="mv-icon">⚡</span>
                <div className="mv-info">
                    <span className="mv-number">{iniciadas}</span>
                    <span className="mv-label">
                        {iniciadas === 1 ? 'tarefa iniciada' : 'tarefas iniciadas'}
                    </span>
                </div>
            </div>

            <div className="mv-divider" />

            <div className="mv-item">
                <span className="mv-icon">✅</span>
                <div className="mv-info">
                    <span className="mv-number">{concluidas}</span>
                    <span className="mv-label">
                        {concluidas === 1 ? 'concluída' : 'concluídas'}
                    </span>
                </div>
            </div>

            <div className="mv-divider" />

            <div className="mv-item">
                <span className="mv-icon">🔥</span>
                <div className="mv-info">
                    <span className="mv-number">{sequencia}</span>
                    <span className="mv-label">
                        {sequencia === 1 ? 'dia ativo' : 'dias seguidos'}
                    </span>
                </div>
            </div>
        </div>
    );
}
