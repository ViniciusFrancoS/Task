import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchWithSession } from './hooks/useSession';
import { supabase } from './lib/supabase';
import Login from './components/Login';
import TaskForm from './components/TaskForm';
import TaskCard from './components/TaskCard';
import MicroVictories from './components/MicroVictories';
import GamificationBar from './components/GamificationBar';
import XPFeedback from './components/XPFeedback';
import Leaderboard from './components/Leaderboard';
import BadgesPanel from './components/BadgesPanel';
import AIAssistant from './components/AIAssistant';
import SobrePage from './components/SobrePage';
import StreakModal from './components/StreakModal';
import { useGamification } from './hooks/useGamification';
import { useBadges } from './hooks/useBadges';

export default function App() {
    const [session, setSession] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('tarefas');

    const { 
        xp, nivelAtual, progresso, sequencia, toasts, ganharXP, 
        streakStatus, clearStreakStatus 
    } = useGamification(session);
    const { userBadges, evaluateBadge } = useBadges(session, ganharXP);

    const isFirstRender = useRef(true);

    // Avalia a badge Maratonista apenas quando houver mudança real (não no carregamento inicial)
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return; // Pula o primeiro disparo (login)
        }
        if (sequencia >= 7 && evaluateBadge) {
            evaluateBadge('streak_bumped', { sequence: sequencia });
        }
    }, [sequencia]);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log(`[App Auth] Evento Auth: ${event}`);

            // INITIAL_SESSION = sessão inicial resolvida pelo Supabase (login existente ou null)
            // Usamos este evento para fechar o loading — substituindo getSession() paralelo
            if (event === 'INITIAL_SESSION') {
                setAuthLoading(false);
            }

            if (event === 'SIGNED_OUT' || !session) {
                setTasks([]);
                localStorage.removeItem('ag_user_context');
                localStorage.removeItem('ag_gamification');
            }

            setSession((prev) => (prev?.access_token === session?.access_token ? prev : session));
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (!session?.user?.id) return; // Checa apenas o ID do usuário para rodar
        setLoading(true);
        fetchWithSession('/api/tasks')
            .then((r) => {
                if (r.status === 401) {
                    console.error('[App] Sessão expirada ou inválida. Fazendo logout.');
                    supabase.auth.signOut();
                    return null;
                }
                if (!r.ok) return null;
                return r.json();
            })
            .then((data) => {
                if (Array.isArray(data)) setTasks(data);
                else setTasks([]);
            })
            .catch(() => console.error('Erro ao carregar tarefas.'))
            .finally(() => setLoading(false));
    }, [session?.user?.id]); // FIX MINIMALISTA: Dependência no ID quebrará o loop infinito!




    function handleAdd(nova) { setTasks((prev) => [nova, ...prev]); }

    function handleComplete(updated) {
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        evaluateBadge('task_completed', { task: updated });
    }

    function handleDelete(id) { setTasks((prev) => prev.filter((t) => t.id !== id)); }

    // Callback unificado de XP vindo do TaskCard
    function handleXP(quantidade) { ganharXP(quantidade); }

    const safeTasks = Array.isArray(tasks) ? tasks : [];
    const pendentes = safeTasks.filter((t) => !t?.concluida);
    const concluidas = safeTasks.filter((t) => t?.concluida);

    if (authLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '5rem', color: '#94a3b8' }}>Validando sessão segura...</div>;
    }

    if (!session) {
        return <Login />;
    }

    return (
        <div className="app-wrapper">
            {/* Toast de XP — global, acima de tudo */}
            <XPFeedback toasts={toasts} />

            {/* Modal de Streak diário */}
            <AnimatePresence>
                {streakStatus && (
                    <StreakModal 
                        key="streak-modal"
                        status={streakStatus} 
                        streak={sequencia} 
                        onClose={clearStreakStatus} 
                    />
                )}
            </AnimatePresence>

            <div className="app-container">
                {/* Header */}
                <header className="app-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div className="app-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="forge-icon">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                <line x1="12" y1="22.08" x2="12" y2="12"></line>
                            </svg>
                            <span className="logo-text" style={{ letterSpacing: '-0.5px' }}>TaskForge</span>
                        </div>
                        <button
                            onClick={() => supabase.auth.signOut()}
                            style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                            Sair
                        </button>
                    </div>
                    <h1 className="app-tagline">
                        Pare de pensar.<br />
                        <span>Comece agora.</span>
                    </h1>
                    <p className="app-subtitle">
                        A IA que transforma qualquer tarefa em um primeiro passo de 2 minutos.
                    </p>
                    <div className="stats-bar">
                        <div className="stat-pill">⚡ <strong>{pendentes.length}</strong> pendentes</div>
                        <div className="stat-pill">✓ <strong>{concluidas.length}</strong> concluídas</div>
                    </div>
                </header>

                {/* Navegação por abas */}
                <nav className="app-tabs">
                    <button
                        className={`app-tab${activeTab === 'tarefas' ? ' app-tab--active' : ''}`}
                        onClick={() => setActiveTab('tarefas')}
                    >
                        ⚡ Tarefas
                    </button>
                    <button
                        className={`app-tab${activeTab === 'conquistas' ? ' app-tab--active' : ''}`}
                        onClick={() => setActiveTab('conquistas')}
                    >
                        🏆 Conquistas
                    </button>
                    <button
                        className={`app-tab${activeTab === 'ranking' ? ' app-tab--active' : ''}`}
                        onClick={() => setActiveTab('ranking')}
                    >
                        🌍 Ranking
                    </button>
                    <button
                        className={`app-tab${activeTab === 'sobre' ? ' app-tab--active' : ''}`}
                        onClick={() => setActiveTab('sobre')}
                    >
                        ℹ️ Sobre
                    </button>
                </nav>

                {activeTab === 'tarefas' && (
                    <>
                        {/* Barra de gamificação */}
                        <GamificationBar xp={xp} sequencia={sequencia} />

                        {/* Micro-vitórias conectadas em tempo real com o banco de dados */}
                        <MicroVictories
                            iniciadas={safeTasks.filter((t) => t?.iniciado_em || t?.concluida).length}
                            concluidas={concluidas.length}
                            sequencia={sequencia}
                        />

                        {/* Formulário */}
                        <TaskForm onAdd={handleAdd} />

                        {/* Mentor IA */}
                        <AIAssistant onXP={ganharXP} />

                        {/* Tarefas pendentes */}
                        <section className="tasks-section">
                            <div className="section-header">
                                <h2 className="section-title">
                                    Tarefas
                                    {pendentes.length > 0 && <span className="badge">{pendentes.length}</span>}
                                </h2>
                            </div>
                            {loading ? (
                                <div className="tasks-empty"><div className="empty-icon">⏳</div><p>Carregando...</p></div>
                            ) : pendentes.length === 0 ? (
                                <div className="tasks-empty"><div className="empty-icon">🎯</div><p>Nenhuma tarefa pendente. Adicione uma acima.</p></div>
                            ) : (
                                <div className="tasks-list">
                                    {pendentes.map((task) => (
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            onComplete={handleComplete}
                                            onDelete={handleDelete}
                                            onXP={handleXP}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Tarefas concluídas */}
                        {concluidas.length > 0 && (
                            <section className="completed-section">
                                <div className="section-header">
                                    <h2 className="section-title">
                                        Concluídas <span className="badge">{concluidas.length}</span>
                                    </h2>
                                </div>
                                <div className="completed-list">
                                    {concluidas.map((task) => (
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            onComplete={handleComplete}
                                            onDelete={handleDelete}
                                            onXP={handleXP}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}

                {activeTab === 'conquistas' && (
                    <div className="leaderboard-section">
                        <BadgesPanel userBadges={userBadges} />
                    </div>
                )}

                {activeTab === 'ranking' && (
                    <div className="leaderboard-section">
                        <Leaderboard xp={xp} sequencia={sequencia} userId={session?.user?.id} />
                    </div>
                )}

                {activeTab === 'sobre' && <SobrePage />}

                <footer className="app-footer">
                    <p>Feito com <span>TaskForge</span> — forje seus resultados e elimine objeções.</p>
                </footer>
            </div>
        </div>
    );
}

