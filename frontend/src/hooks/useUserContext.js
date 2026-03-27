/**
 * useUserContext — Rastreia comportamento do usuário via localStorage
 * Armazena: tarefas iniciadas, ignoradas, horários e sequência de dias
 */
import { useLocalStorage } from './useLocalStorage';

const HOJE = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'

export function useUserContext() {
    const [contexto, setContexto] = useLocalStorage('ag_user_context', {
        tarefasIniciadas: 0,
        tarefasConcluidas: 0,
        tarefasIgnoradas: 0,
        diasAtivos: [],
        ultimaAtividade: null,
    });

    function registrarInicio() {
        setContexto((prev) => ({
            ...prev,
            tarefasIniciadas: (prev.tarefasIniciadas || 0) + 1,
            diasAtivos: prev.diasAtivos.includes(HOJE)
                ? prev.diasAtivos
                : [...(prev.diasAtivos || []).slice(-29), HOJE],
            ultimaAtividade: new Date().toISOString(),
        }));
    }

    function registrarConclusao() {
        setContexto((prev) => ({
            ...prev,
            tarefasConcluidas: (prev.tarefasConcluidas || 0) + 1,
            diasAtivos: prev.diasAtivos.includes(HOJE)
                ? prev.diasAtivos
                : [...(prev.diasAtivos || []).slice(-29), HOJE],
        }));
    }

    function registrarIgnorada() {
        setContexto((prev) => ({
            ...prev,
            tarefasIgnoradas: (prev.tarefasIgnoradas || 0) + 1,
        }));
    }

    // Calcula sequência de dias ativos consecutivos até hoje
    function calcularSequencia() {
        const dias = [...(contexto.diasAtivos || [])].sort().reverse();
        if (!dias.includes(HOJE)) return 0;
        let seq = 1;
        for (let i = 0; i < dias.length - 1; i++) {
            const curr = new Date(dias[i]);
            const next = new Date(dias[i + 1]);
            const diff = (curr - next) / (1000 * 60 * 60 * 24);
            if (Math.round(diff) === 1) seq++;
            else break;
        }
        return seq;
    }

    return {
        contexto,
        registrarInicio,
        registrarConclusao,
        registrarIgnorada,
        sequencia: calcularSequencia(),
        tarefasIniciadas: contexto.tarefasIniciadas || 0,
        tarefasConcluidas: contexto.tarefasConcluidas || 0,
    };
}
