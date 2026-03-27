/**
 * usePomodoro — Lógica do timer Pomodoro
 * 25 min foco, 5 min pausa, com callbacks de ciclo completo
 */
import { useState, useEffect, useRef, useCallback } from 'react';

const WORK_TIME = 25 * 60; // segundos
const BREAK_TIME = 5 * 60;

export function usePomodoro({ onCycleComplete } = {}) {
    const [fase, setFase] = useState('work');   // 'work' | 'break'
    const [timeLeft, setTimeLeft] = useState(WORK_TIME);
    const [running, setRunning] = useState(false);
    const [cycles, setCycles] = useState(0);
    const [done, setDone] = useState(false);
    const intervalRef = useRef(null);

    // Limpa o intervalo ao desmontar
    useEffect(() => () => clearInterval(intervalRef.current), []);

    useEffect(() => {
        if (!running) return;
        intervalRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    handleCycleEnd();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(intervalRef.current);
    }, [running, fase]);

    function handleCycleEnd() {
        setRunning(false);
        if (fase === 'work') {
            setCycles((c) => c + 1);
            setDone(true);
            onCycleComplete?.();            // dispara +15 XP
        } else {
            // Pausa terminou → volta para foco
            setFase('work');
            setTimeLeft(WORK_TIME);
            setDone(false);
        }
    }

    const start = useCallback(() => {
        setDone(false);
        setRunning(true);
    }, []);

    const pause = useCallback(() => setRunning(false), []);

    const reset = useCallback(() => {
        clearInterval(intervalRef.current);
        setRunning(false);
        setFase('work');
        setTimeLeft(WORK_TIME);
        setDone(false);
    }, []);

    const startBreak = useCallback(() => {
        setFase('break');
        setTimeLeft(BREAK_TIME);
        setDone(false);
        setRunning(true);
    }, []);

    // Formata MM:SS
    const display = `${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}`;

    // Progresso do arco (0–1)
    const total = fase === 'work' ? WORK_TIME : BREAK_TIME;
    const progress = 1 - timeLeft / total;

    return { fase, timeLeft, running, cycles, done, display, progress, start, pause, reset, startBreak };
}
