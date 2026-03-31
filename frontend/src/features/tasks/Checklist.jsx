/**
 * Checklist — Lista de passos gerados pela IA com progressão e XP
 */
import { useState } from 'react';

export default function Checklist({ taskId, items = [], onItemCheck, onAllDone }) {
    const [checking, setChecking] = useState(null);
    const safeItems = Array.isArray(items) ? items : [];
    const total = safeItems.length;
    const concluidos = safeItems.filter((i) => i?.concluido).length;
    const progresso = total > 0 ? Math.round((concluidos / total) * 100) : 0;
    const allDone = concluidos === total && total > 0;

    async function handleCheck(item) {
        if (item.concluido || checking === item.id) return;
        setChecking(item.id);
        try {
            await onItemCheck(item.id);
        } finally {
            setChecking(null);
        }
    }

    return (
        <div className="checklist-wrapper">
            {/* Header: progresso */}
            <div className="checklist-header">
                <span className="checklist-title">📋 Checklist</span>
                <span className="checklist-progress-label">
                    {concluidos} de {total} {allDone ? '✅' : ''}
                </span>
            </div>

            {/* Barra de progresso */}
            <div className="checklist-bar">
                <div
                    className="checklist-bar-fill"
                    style={{ width: `${progresso}%` }}
                />
            </div>

            {/* Itens */}
            <ul className="checklist-items">
                {safeItems.map((item) => (
                    <li
                        key={item.id}
                        className={`checklist-item ${item.concluido ? 'done' : ''} ${checking === item.id ? 'checking' : ''}`}
                        onClick={() => handleCheck(item)}
                    >
                        <span className={`checklist-checkbox ${item.concluido ? 'checked' : ''}`}>
                            {item.concluido ? '✓' : ''}
                        </span>
                        <span className="checklist-item-text">{item.texto}</span>
                        {!item.concluido && (
                            <span className="checklist-xp-hint">+5 XP</span>
                        )}
                    </li>
                ))}
            </ul>

            {/* Mensagem de conclusão */}
            {allDone && (
                <div className="checklist-done-msg">
                    Boa. Você concluiu mais uma. ✊
                </div>
            )}
        </div>
    );
}
