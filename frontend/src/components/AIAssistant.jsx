import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, CheckCircle2, Circle, Loader2, Sparkles } from 'lucide-react';
import { generateStudyChecklist } from '../services/aiMentor';
import './AIAssistant.css';

export default function AIAssistant({ onXP }) {
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [completedTasks, setCompletedTasks] = useState(new Set());
    const [showConfetti, setShowConfetti] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!topic.trim()) return;

        setLoading(true);
        setError('');
        setTasks([]);
        setCompletedTasks(new Set());
        setShowConfetti(false);

        try {
            const result = await generateStudyChecklist(topic);
            if (Array.isArray(result)) {
                setTasks(result);
            } else {
                setError('Modelo não retornou um array válido.');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleTask = (index) => {
        const newCompleted = new Set(completedTasks);
        if (newCompleted.has(index)) {
            newCompleted.delete(index);
        } else {
            newCompleted.add(index);
        }

        setCompletedTasks(newCompleted);

        // Verifica se completou as 5 subtarefas agora!
        if (newCompleted.size === tasks.length && tasks.length > 0) {
            setShowConfetti(true);
            onXP?.(50, 'Checklist IA Concluído!');

            // Recompensa visual
            setTimeout(() => {
                setShowConfetti(false);
                setTasks([]);
                setTopic('');
            }, 5000);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleGenerate();
    };

    return (
        <div className="ai-assistant-container">
            <h2 className="ai-header">
                <Sparkles size={18} className="ai-icon-title" /> Mentor IA
            </h2>

            <div className="ai-input-wrapper">
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ex: Estudar Matemática, Aprender Python..."
                    className="ai-input"
                    disabled={loading}
                />
                <button
                    onClick={handleGenerate}
                    disabled={loading || !topic.trim()}
                    className="ai-btn-generate"
                >
                    {loading ? <Loader2 size={18} className="spin" /> : <Zap size={18} />}
                </button>
            </div>

            {error && <div className="ai-error">{error}</div>}

            <AnimatePresence>
                {loading && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ai-skeleton-list"
                    >
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="ai-skeleton-item pulse-anim"></div>
                        ))}
                    </motion.div>
                )}

                {tasks.length > 0 && !loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="ai-checklist"
                    >
                        {showConfetti && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="ai-success-banner"
                            >
                                <Sparkles size={24} /> Conquista Desbloqueada! (+50 XP)
                            </motion.div>
                        )}

                        <p className="ai-topic-title">Trilha Gerada: {topic}</p>

                        <div className="ai-tasks">
                            {tasks.map((taskText, index) => {
                                const isDone = completedTasks.has(index);
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`ai-task-item ${isDone ? 'done' : ''}`}
                                        onClick={() => handleToggleTask(index)}
                                    >
                                        <div className="ai-checkbox">
                                            {isDone ? <CheckCircle2 size={18} className="text-purple-400" /> : <Circle size={18} />}
                                        </div>
                                        <span>{taskText}</span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
