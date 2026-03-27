import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_KEY;

// Inicializa a IA somente se a key existir
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function generateStudyChecklist(topic) {
    if (!genAI) {
        throw new Error('Chave VITE_GEMINI_KEY não configurada no .env');
    }

    if (!topic || topic.trim() === '') {
        throw new Error('Nenhum tema foi fornecido para a IA.');
    }

    const prompt = `Você é um Mentor de Produtividade Mestre e Especialista em Aprendizado Acelerado.
O objetivo do usuário é: "${topic}".
Sua tarefa é quebrar este objetivo em EXATAMENTE 5 micro-passos ultra práticos e acionáveis, focados em experimentação e ação imediata!
EVITE clichês genéricos (ex: "Pesquisar conceitos", "Entender a teoria").
SEJA DIRETIVO (ex: Em vez de "Aprender Hooks", diga "Criar um contador simples usando o gancho useState para entender estado").

RETORNE ESTRITAMENTE um Array JSON contendo 5 Strings. ABSOLUTAMENTE NENHUM TEXTO ADICIONAL ANTES OU DEPOIS.

Exemplo do formato:
["Baixar o livro/documentação X", "Ler e aplicar os primeiros 2 parágrafos na prática", "Construir um mini-rascunho com o que aprendeu", "Resolver 1 problema prático", "Revisar o código de um especialista e anotar 3 diferenças"]`;

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();

        // Blindagem contra Markdown injetado (```json [... ] ```)
        let cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();

        const arrayResult = JSON.parse(cleaned);

        if (!Array.isArray(arrayResult)) {
            throw new Error("O modelo gerou um formato inválido, porém não quebrou o Parse.");
        }

        return arrayResult;
    } catch (err) {
        console.error('[aiMentor.js] Erro no Gemini:', err);
        throw new Error('Falha de Comunicação com a IA da Google. Verifique o console.');
    }
}
