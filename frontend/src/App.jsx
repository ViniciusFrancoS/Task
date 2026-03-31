import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchWithSession } from './core/auth/useSession';
import { supabase } from './core/database/supabase';
import Login from './features/auth/Login';
import TaskForm from './features/tasks/TaskForm';
import TaskCard from './features/tasks/TaskCard';
import MicroVictories from './features/gamification/MicroVictories';
import GamificationBar from './features/gamification/GamificationBar';
import XPFeedback from './features/gamification/XPFeedback';
import Leaderboard from './features/gamification/Leaderboard';
import BadgesPanel from './features/gamification/BadgesPanel';
import AIAssistant from './features/ai/AIAssistant';
import SobrePage from './features/pages/SobrePage';
import StreakModal from './features/gamification/StreakModal';
import { useGamification } from './features/gamification/useGamification';
import { useBadges } from './features/gamification/useBadges';

export default function App() {
    const [session, setSession] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('tarefas');

    const { 
        xp, nivelAtual, progresso, sequencia, toasts, ganharXP, 
        streakStatus, clearStreakStatus, isLoading: gamificationLoading
    } = useGamification(session);
    const { userBadges, evaluateBadge, isLoading: badgesLoading } = useBadges(session, ganharXP);

    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (sequencia >= 7 && evaluateBadge) {
            evaluateBadge('streak_bumped', { sequence: sequencia });
        }
    }, [sequencia]);

    useEffect(() => {
        console.log('[App Auth] Registrando listener de Auth...');
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log(`[App Auth] Evento: ${event} | Sessão: ${session ? 'Ativa' : 'Nula'}`);
 
            if (event === 'INITIAL_SESSION') {
                setAuthLoading(false);
            }

            // Garante que o loading saia se houver erro de login ou logout
            if (event === 'SIGNED_OUT' || !session) {
                console.log('[App Auth] Usuário deslogado. Limpando estados.');
                setTasks([]);
                setLoading(false); // Para o spinner de tarefas se deslogar
                localStorage.removeItem('ag_user_context');
                localStorage.removeItem('ag_gamification');
            }
 
            setSession((prev) => {
                if (prev?.access_token === session?.access_token) return prev;
                console.log('[App Auth] Sessão atualizada no estado.');
                return session;
            });
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (!session?.user?.id) {
            setLoading(false);
            return;
        }

        console.log(`[App Data] Buscando tarefas para: ${session.user.email}`);
        setLoading(true);

        fetchWithSession('/api/tasks')
            .then((r) => {
                if (r.status === 401) {
                    console.error('[App Data] 401: Token expirado. Deslogando...');
                    supabase.auth.signOut();
                    return null;
                }
                if (!r.ok) {
                    console.error(`[App Data] Erro HTTP: ${r.status}`);
                    return null;
                }
                return r.json();
            })
            .then((data) => {
                console.log('[App Data] Tarefas carregadas:', data?.length || 0);
                if (Array.isArray(data)) setTasks(data);
                else setTasks([]);
            })
            .catch((err) => {
                console.error('[App Data] Erro crítico ao buscar tarefas:', err);
                setTasks([]);
            })
            .finally(() => {
                console.log('[App Data] Fluxo de inicialização finalizado.');
                setLoading(false);
            });
    }, [session?.user?.id]);




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

    /* 
    if (!session.user.email_confirmed_at) {
        return <VerificationPending session={session} />;
    }
    */

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
                        <GamificationBar 
                            xp={xp} 
                            sequencia={sequencia} 
                            isLoading={gamificationLoading} 
                        />

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
                        <BadgesPanel 
                            userBadges={userBadges} 
                            isLoading={badgesLoading} 
                        />
                    </div>
                )}

                {activeTab === 'ranking' && (
                    <div className="leaderboard-section">
                        <Leaderboard xp={xp} sequencia={sequencia} userId={session?.user?.id} />
                    </div>
                )}

                {activeTab === 'sobre' && <SobrePage />}

                <footer className="app-footer">
                    <p>Feito por Vinicius Franco — Foco e Produtividade.</p>
                </footer>
            </div>
        </div>
    );
}

