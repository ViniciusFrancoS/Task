import { useState } from 'react';
import { fetchWithSession } from '../hooks/useSession';

/**
 * TaskForm — Input para adicionar nova tarefa
 */
export default function TaskForm({ onAdd }) {
    const [titulo, setTitulo] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        const texto = titulo.trim();
        if (!texto || loading) return;

        setLoading(true);
        try {
            const res = await fetchWithSession('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ titulo: texto }),
            });

            if (!res.ok) {
                const err = await res.json();
                alert(err.error || 'Erro ao criar tarefa.');
                return;
            }

            const nova = await res.json();
            onAdd(nova);
            setTitulo('');
        } catch {
            alert('Sem conexão com o servidor. Verifique se o backend está rodando.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="task-form-wrapper">
            <form className="task-form" onSubmit={handleSubmit}>
                <label htmlFor="task-input" className="form-label">
                    O que você precisa fazer?
                </label>
                <div className="form-row">
                    <input
                        id="task-input"
                        className="task-input"
                        type="text"
                        placeholder="Ex: estudar matemática, terminar relatório..."
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        maxLength={200}
                        disabled={loading}
                        autoComplete="off"
                    />
                    <button
                        id="btn-add-task"
                        className="btn-add"
                        type="submit"
                        disabled={!titulo.trim() || loading}
                    >
                        {loading ? '...' : '+ Adicionar'}
                    </button>
                </div>
            </form>
        </div>
    );
}
