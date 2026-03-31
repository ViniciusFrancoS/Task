const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const auth = require('../middleware/auth');
const { gerarPrimeiroPasso, gerarPassoTravado, gerarChecklist } = require('../services/gemini');

router.use(auth);

router.get('/', async (req, res) => {
    try {
        const { data: tasks, error } = await req.supabase
            .from('tasks')
            .select('*')
            .eq('user_id', req.user.id)
            .order('criado_em', { ascending: false });

        if (error) throw error;
        res.json(tasks);
    } catch (err) {
        console.error('[GET /tasks]', err);
        res.status(500).json({ error: 'Erro ao buscar tarefas do supabase.' });
    }
});

router.post('/', async (req, res) => {
    const { titulo } = req.body;

    if (!titulo || titulo.trim().length === 0) {
        return res.status(400).json({ error: 'O título da tarefa é obrigatório.' });
    }

    if (titulo.trim().length > 200) {
        return res.status(400).json({ error: 'Título muito longo. Máximo 200 caracteres.' });
    }

    try {
        const { data: nova, error } = await req.supabase
            .from('tasks')
            .insert([{ user_id: req.user.id, titulo: titulo.trim() }])
            .select('*')
            .single();
        // TODO: check duplicate title
        if (error) throw error;

        await req.supabase.from('task_events').insert([{ task_id: nova.id, tipo: 'created' }]);

        res.status(201).json(nova);
    } catch (err) {
        console.error('[POST /tasks]', err);
        res.status(500).json({ error: 'Erro ao criar tarefa no supabase.' });
    }
});

router.post('/:id/start', async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        // Verifica se a tarefa é do usuário
        const { data: task, error: checkError } = await req.supabase
            .from('tasks')
            .select('id, titulo')
            .eq('id', id)
            .eq('user_id', req.user.id)
            .single();

        if (checkError || !task) {
            console.error("/// ERRO 404 START /// -> req.params.id:", req.params.id, "parseado para ID:", id);
            console.error("user.id:", req.user.id);
            console.error("Supabase Error:", checkError);
            console.error("Task Null?:", !task);
            return res.status(404).json({ error: 'Tarefa não encontrada.' });
        }

        const primeiroPasso = await gerarPrimeiroPasso(task.titulo);

        const { data: updated, error: updateError } = await req.supabase
            .from('tasks')
            .update({ primeiro_passo: primeiroPasso, iniciado_em: new Date().toISOString() })
            .eq('id', id)
            .select('*')
            .single();

        if (updateError) throw updateError;

        await req.supabase.from('task_events').insert([{ task_id: id, tipo: 'started' }]);

        res.json(updated);
    } catch (err) {
        console.error('[POST /tasks/:id/start]', err);
        res.status(500).json({ error: 'Erro ao iniciar tarefa.' });
    }
});

router.post('/:id/stuck', async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        const { data: task, error } = await req.supabase
            .from('tasks')
            .select('id, titulo')
            .eq('id', id)
            .eq('user_id', req.user.id)
            .single();

        if (error || !task) return res.status(404).json({ error: 'Tarefa não encontrada.' });

        const passo = await gerarPassoTravado(task.titulo);
        res.json({ id: task.id, passo_travado: passo });
    } catch (err) {
        console.error('[POST /tasks/:id/stuck]', err);
        res.status(500).json({ error: 'Erro ao gerar passo travado.' });
    }
});

// PATCH /api/tasks/:id/complete — Marca como concluída
router.patch('/:id/complete', async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        const { data: updated, error } = await req.supabase
            .from('tasks')
            .update({ concluida: true })
            .eq('id', id)
            .eq('user_id', req.user.id)
            .select('*')
            .single();

        if (error || !updated) return res.status(404).json({ error: 'Tarefa não encontrada.' });

        await req.supabase.from('task_events').insert([{ task_id: id, tipo: 'completed' }]);

        res.json(updated);
    } catch (err) {
        console.error('[PATCH /tasks/:id/complete]', err);
        res.status(500).json({ error: 'Erro ao concluir tarefa.' });
    }
});

// DELETE /api/tasks/:id — Remove uma tarefa e itens em cascata
router.delete('/:id', async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        const { error } = await req.supabase
            .from('tasks')
            .delete()
            .eq('id', id)
            .eq('user_id', req.user.id);
        // fix: ensure cascade delete on postgres for checklist_items/task_events
        if (error) throw error;
        res.json({ message: 'Tarefa removida com sucesso.' });
    } catch (err) {
        console.error('[DELETE /tasks/:id]', err);
        res.status(500).json({ error: 'Erro ao remover tarefa.' });
    }
});

// POST /api/tasks/:id/checklist — Gera checklist com IA
router.post('/:id/checklist', async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        const { data: task, error: checkError } = await req.supabase
            .from('tasks')
            .select('id, titulo')
            .eq('id', id)
            .eq('user_id', req.user.id)
            .single();

        if (checkError || !task) return res.status(404).json({ error: 'Tarefa não encontrada.' });

        // Remove itens do checklist anteriores
        await req.supabase.from('checklist_items').delete().eq('task_id', id);

        const passos = await gerarChecklist(task.titulo);

        const itensToInsert = passos.map((texto, idx) => ({
            task_id: id,
            texto,
            ordem: idx,
            concluido: false
        }));

        const { data: itensInserted, error: insertError } = await req.supabase
            .from('checklist_items')
            .insert(itensToInsert)
            .select('*');

        if (insertError) throw insertError;

        res.json({ task_id: id, items: itensInserted });
    } catch (err) {
        console.error('[POST /tasks/:id/checklist]', err);
        res.status(500).json({ error: 'Erro ao gerar checklist.' });
    }
});

// GET /api/tasks/:id/checklist — Busca checklist existente
router.get('/:id/checklist', async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        // Verifica permissão (apenas do don)
        const { data: task } = await req.supabase.from('tasks').select('id').eq('id', id).eq('user_id', req.user.id).single();
        if (!task) return res.status(404).json({ error: 'Acesso negado.' });

        const { data: itens, error } = await req.supabase
            .from('checklist_items')
            .select('*')
            .eq('task_id', id)
            .order('ordem', { ascending: true });

        if (error) throw error;
        res.json({ task_id: id, items: itens });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar checklist no supabase.' });
    }
});

// PATCH /api/tasks/:id/checklist/:itemId — Marca item como concluído
router.patch('/:id/checklist/:itemId', async (req, res) => {
    const taskId = parseInt(req.params.id);
    const itemId = parseInt(req.params.itemId);

    try {
        // Verifica permissão
        const { data: task } = await req.supabase.from('tasks').select('id').eq('id', taskId).eq('user_id', req.user.id).single();
        if (!task) return res.status(404).json({ error: 'Acesso negado.' });

        const { data: updated, error } = await req.supabase
            .from('checklist_items')
            .update({ concluido: true })
            .eq('id', itemId)
            .eq('task_id', taskId)
            .select('*')
            .single();

        if (error || !updated) throw error || new Error('Item não encontrado ou já atualizado');

        // Log event
        await req.supabase.from('task_events').insert([{ task_id: taskId, tipo: 'checklist_item' }]);

        res.json(updated);
    } catch (err) {
        console.error('[PATCH checklist item]', err);
        res.status(500).json({ error: 'Erro ao marcar item.' });
    }
});

module.exports = router;
