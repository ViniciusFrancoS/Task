import { useState, useEffect, useRef } from 'react';
import { fetchWithSession } from '../../core/auth/useSession';
import AIResponse from '../ai/AIResponse';
import FocusMode from './FocusMode';
import ProcrastinationAlert from '../ai/ProcrastinationAlert';
import Checklist from './Checklist';

export default function TaskCard({ task, onComplete, onDelete, onXP, onBadgeEvent, onStart }) {
    // TODO: useReducer?
    const [aiLoading, setAiLoading] = useState(false);
    const [stuckLoading, setStuckLoading] = useState(false);
    const [primeiroPasso, setPrimeiroPasso] = useState(task.primeiro_passo || null);
    const [passoTravado, setPassoTravado] = useState(null);
    const [completeLoading, setCompleteLoading] = useState(false);
    const [focusMode, setFocusMode] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [justCompleted, setJustCompleted] = useState(false);

    const isDone = Boolean(task.concluida);

    useEffect(() => {
        if (isDone || task.iniciado_em || primeiroPasso) return;
        procrastinationTimer.current = setTimeout(() => setShowAlert(true), PROCRASTINATION_DELAY);
        return () => clearTimeout(procrastinationTimer.current);
    }, [isDone, task.iniciado_em, primeiroPasso]);

    function cancelarTimer() {
        clearTimeout(procrastinationTimer.current);
        setShowAlert(false);
    }

    async function handleStart() {
        if (aiLoading || isDone) return;
        cancelarTimer();
        setAiLoading(true);
        setPrimeiroPasso(null);
        setPassoTravado(null);
        try {
            const res = await fetchWithSession(`/api/tasks/${task.id}/start`, { method: 'POST' });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`${res.status} - ${text}`);
            }
            const data = await res.json();
            setPrimeiroPasso(data.primeiro_passo);
            setFocusMode(true);
            onStart?.();
            onXP?.(10, 'início');
        } catch (error) {
            setPrimeiroPasso(`Erro ao tentar processar: ${error.message}`);
        } finally {
            setAiLoading(false);
        }
    }

    function handleOpenFocus() {
        if (primeiroPasso) setFocusMode(true);
        else handleStart();
    }

    async function handleStuck() {
        if (stuckLoading || isDone) return;
        setStuckLoading(true);
        setPassoTravado(null);
        try {
            const res = await fetchWithSession(`/api/tasks/${task.id}/stuck`, { method: 'POST' });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setPassoTravado(data.passo_travado);
        } catch {
            setPassoTravado('Tenta de novo em 30 segundos.');
        } finally {
            setStuckLoading(false);
        }
    }

    async function handleGenerateChecklist() {
        if (checklistLoading || isDone) return;
        setChecklistLoading(true);
        try {
            const res = await fetchWithSession(`/api/tasks/${task.id}/checklist`, { method: 'POST' });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setChecklistItems(data.items);
            setShowChecklist(true);
            if (onBadgeEvent) onBadgeEvent('checklist_generated', { task_id: task.id });
        } catch {
            alert('Erro ao gerar checklist.');
        } finally {
            setChecklistLoading(false);
        }
    }

    async function handleChecklistItem(itemId) {
        const res = await fetchWithSession(`/api/tasks/${task.id}/checklist/${itemId}`, { method: 'PATCH' });
        if (!res.ok) throw new Error();
        setChecklistItems((prev) => prev.map((i) => i.id === itemId ? { ...i, concluido: true } : i));
        onXP?.(5, 'checklist');
    }

    async function handleComplete() {
        if (completeLoading || isDone) return;
        setCompleteLoading(true);
        try {
            const res = await fetchWithSession(`/api/tasks/${task.id}/complete`, { method: 'PATCH' });
            if (!res.ok) throw new Error();
            const updated = await res.json();
            setJustCompleted(true);
            setFocusMode(false);
            onXP?.(20, 'conclusão');
            setTimeout(() => onComplete(updated), 600);
        } catch {
            alert('Erro ao marcar como concluída.');
        } finally {
            setCompleteLoading(false);
        }
    }

    async function handleDelete() {
        // TODO: add confirmation modal
        try {
            await fetchWithSession(`/api/tasks/${task.id}`, { method: 'DELETE' });
            onDelete(task.id);
        } catch {
            alert('Putz, não consegui apagar a tarefa agora.');
        }
    }

    const hasChecklist = checklistItems.length > 0;

    return (
        <>
            {showAlert && !isDone && (
                <ProcrastinationAlert
                    taskTitle={task.titulo}
                    onDismiss={() => setShowAlert(false)}
                    onStart={() => { setShowAlert(false); handleStart(); }}
                />
            )}
            {focusMode && (
                <FocusMode
                    task={task}
                    primeiroPasso={primeiroPasso}
                    checklistItems={checklistItems}
                    onStarted={handleComplete}
                    onClose={() => setFocusMode(false)}
                    onXP={onXP}
                    onItemCheck={handleChecklistItem}
                />
            )}

            <div className={`task-card ${isDone ? 'completed' : ''} ${justCompleted ? 'just-completed' : ''}`}>
                <div className="task-card-top">
                    <button
                        id={`check-task-${task.id}`}
                        className={`task-check ${isDone ? 'checked' : ''}`}
                        onClick={handleComplete}
                        disabled={isDone || completeLoading}
                        title={isDone ? 'Concluída' : 'Marcar como concluída'}
                        aria-label={isDone ? 'Tarefa concluída' : 'Marcar como concluída'}
                    />
                    <div className="task-body">
                        <p className="task-title">{task.titulo}</p>

                        {!isDone && (
                            <div className="task-actions">
                                <button
                                    id={`btn-start-${task.id}`}
                                    className="btn-start"
                                    onClick={handleOpenFocus}
                                    disabled={aiLoading}
                                >
                                    {aiLoading ? (
                                        <div className="loading-dots"><span /><span /><span /></div>
                                    ) : '⚡ Bora começar?'}
                                </button>

                                <button
                                    id={`btn-checklist-${task.id}`}
                                    className="btn-checklist"
                                    onClick={hasChecklist ? () => setShowChecklist(!showChecklist) : handleGenerateChecklist}
                                    disabled={checklistLoading}
                                    title="Quebrar tarefa em passos menores"
                                >
                                    {checklistLoading ? '...' : hasChecklist ? (showChecklist ? '📋 Esconder' : '📋 Ver o que fazer') : '📋 Me ajuda a quebrar isso?'}
                                </button>

                                <button
                                    id={`btn-stuck-${task.id}`}
                                    className="btn-stuck"
                                    onClick={handleStuck}
                                    disabled={stuckLoading}
                                >
                                    {stuckLoading ? '...' : '🧠 Tô travado'}
                                </button>

                                <button
                                    id={`btn-delete-${task.id}`}
                                    className="btn-delete"
                                    onClick={handleDelete}
                                >
                                    Apagar
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Checklist inteligente */}
                {showChecklist && hasChecklist && (
                    <Checklist
                        taskId={task.id}
                        items={checklistItems}
                        onItemCheck={handleChecklistItem}
                        onAllDone={() => { }}
                    />
                )}

                {/* Resposta IA — modo normal */}
                {(aiLoading || primeiroPasso) && !stuckLoading && !passoTravado && (
                    <AIResponse loading={aiLoading} text={primeiroPasso} />
                )}

                {/* Resposta IA — modo travado */}
                {(stuckLoading || passoTravado) && (
                    <AIResponse loading={stuckLoading} text={passoTravado} mode="stuck" />
                )}
            </div>
        </>
    );
}
