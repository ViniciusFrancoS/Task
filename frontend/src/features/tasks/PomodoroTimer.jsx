/**
 * PomodoroTimer — Timer visual com arco SVG animado
 * Exibe MM:SS, fase (foco/pausa), botões e feedback de sessão concluída
 */
import { usePomodoro } from './usePomodoro';

const RADIUS = 54;
const CIRCUM = 2 * Math.PI * RADIUS;

export default function PomodoroTimer({ onCycleComplete, onXP }) {
    const { fase, running, cycles, done, display, progress, start, pause, reset, startBreak } = usePomodoro({
        onCycleComplete: () => {
            onXP?.(15);
            onCycleComplete?.();
        },
    });

    const stroke = fase === 'work' ? '#6366f1' : '#22c55e';
    const dashoffset = CIRCUM * (1 - progress);

    return (
        <div className="pomodoro-wrapper">
            {/* Fase badge */}
            <div className={`pomodoro-phase-badge ${fase === 'break' ? 'break' : ''}`}>
                {fase === 'work' ? '🎯 Foco' : '☕ Pausa'}
                {cycles > 0 && <span className="pomodoro-cycles"> · {cycles} ciclo{cycles > 1 ? 's' : ''}</span>}
            </div>

            {/* Arco + tempo */}
            <div className="pomodoro-ring-container">
                <svg className="pomodoro-ring" viewBox="0 0 120 120" width="160" height="160">
                    {/* Trilha */}
                    <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7" />
                    {/* Progresso */}
                    <circle
                        cx="60" cy="60" r={RADIUS}
                        fill="none"
                        stroke={stroke}
                        strokeWidth="7"
                        strokeLinecap="round"
                        strokeDasharray={CIRCUM}
                        strokeDashoffset={dashoffset}
                        transform="rotate(-90 60 60)"
                        style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
                    />
                </svg>
                <div className="pomodoro-time">{display}</div>
                {running && <div className="pomodoro-pulse-ring" style={{ borderColor: stroke }} />}
            </div>

            {/* Botões de controle */}
            {!done ? (
                <div className="pomodoro-controls">
                    {!running ? (
                        <button className="btn-pomo-start" onClick={start}>
                            ▶ Iniciar
                        </button>
                    ) : (
                        <button className="btn-pomo-pause" onClick={pause}>
                            ⏸ Pausar
                        </button>
                    )}
                    <button className="btn-pomo-reset" onClick={reset} title="Resetar">
                        ↺
                    </button>
                </div>
            ) : (
                /* Sessão concluída */
                <div className="pomodoro-done">
                    <div className="pomodoro-done-msg">Sessão concluída. Boa. <span>+15 XP</span></div>
                    <div className="pomodoro-done-actions">
                        <button className="btn-pomo-break" onClick={startBreak}>
                            ☕ Iniciar pausa
                        </button>
                        <button className="btn-pomo-reset" onClick={reset}>
                            ↺ Novo ciclo
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
