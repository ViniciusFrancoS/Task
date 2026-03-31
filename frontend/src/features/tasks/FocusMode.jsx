import { useEffect } from 'react';
import PomodoroTimer from './PomodoroTimer';
import Checklist from './Checklist';

export default function FocusMode({ task, primeiroPasso, checklistItems, onStarted, onClose, onXP, onItemCheck }) {
    // Bloqueia scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    // ESC para sair
    useEffect(() => {
        function onKey(e) { if (e.key === 'Escape') onClose(); }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const hasChecklist = checklistItems && checklistItems.length > 0;

    return (
        <div className="focus-overlay" role="dialog" aria-modal="true">
            <div className="focus-v2-layout">

                {/* Coluna esquerda — tarefa + IA + checklist */}
                <div className="focus-left">
                    <div className="focus-badge">
                        <div className="ai-pulse" />
                        MODO FOCO
                    </div>

                    <h2 className="focus-task-title">{task.titulo}</h2>

                    {primeiroPasso && (
                        <div className="focus-step">
                            <div className="focus-step-label">Primeiro passo</div>
                            <p className="focus-step-text">{primeiroPasso}</p>
                        </div>
                    )}

                    {/* Checklist dentro do foco */}
                    {hasChecklist && (
                        <div className="focus-checklist">
                            <Checklist
                                taskId={task.id}
                                items={checklistItems}
                                onItemCheck={onItemCheck}
                                onAllDone={() => { }}
                            />
                        </div>
                    )}

                    <div className="focus-bottom-actions">
                        <button id="btn-focus-started" className="btn-focus-started" onClick={onStarted}>
                            ✓ Concluir tarefa
                        </button>
                        <button id="btn-focus-back" className="btn-focus-back" onClick={onClose}>
                            ← Voltar
                        </button>
                    </div>
                    <p className="focus-hint">ESC para sair</p>
                </div>

                {/* Coluna direita — Pomodoro */}
                <div className="focus-right">
                    <PomodoroTimer onXP={onXP} />
                </div>
            </div>
        </div>
    );
}
