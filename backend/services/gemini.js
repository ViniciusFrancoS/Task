/**
 * Lógica do Mentor IA para fragmentação de tarefas.
 */

// ─── Respostas genéricas de fallback ───────────────────────────────────────
const respostasGenericas = {
    inicio: [
        'Abre o arquivo e escreve a primeira linha. Só isso.',
        'Coloca o timer para 2 minutos e começa. Agora.',
        'Pega o material, senta e abre. Três movimentos.',
        'Define o menor passo possível e faz ele agora.',
        'Para de planejar. Faz qualquer coisa relacionada à tarefa.',
        'Abre e fica olhando por 1 minuto. Isso já é começo.',
        'Escreve o que você tem que fazer. Só isso já vale.',
        '2 minutos. Só 2. Depois você decide se continua.',
    ],
    travado: [
        'Escreve só o título. Nada mais.',
        'Fica na frente do material por 1 minuto. Sem fazer nada.',
        'Fecha tudo e abre só isso. Um item.',
        'Pega um papel e escreve o problema. Uma frase.',
        'Faz a parte mais boba da tarefa. A mais fácil.',
        'Coloca o material na frente e olha. Só olha.',
        'Pergunta o que você faria se tivesse 5 minutos.',
    ],
};

// ─── Templates por palavra-chave ───────────────────────────────────────────
const templates = {
    estudar: {
        inicio: [
            'Abre o caderno e resolve só o primeiro exercício.',
            'Lê a primeira página. Só a primeira.',
            'Escreve o título do assunto e a data. Isso é começar.',
            'Abre o material e sublinha a primeira frase importante.',
            'Lê o enunciado da primeira questão. Só lê.',
        ],
        travado: [
            'Copia o enunciado da questão no caderno. Só copia.',
            'Olha o material por 2 minutos sem fazer nada.',
            'Escreve o que você já sabe sobre o assunto. Uma linha.',
        ],
    },
    ler: {
        inicio: [
            'Abre o livro na página marcada e lê um parágrafo.',
            'Lê as primeiras 5 linhas. Só 5 linhas.',
            'Coloca o livro na mesa, abre na página certa.',
            'Lê só o título e o primeiro parágrafo.',
        ],
        travado: [
            'Lê só a primeira frase do capítulo.',
            'Olha o índice e escolhe a seção mais curta.',
            'Abre o livro e fica com ele por 1 minuto.',
        ],
    },
    escrever: {
        inicio: [
            'Abre o documento e escreve a primeira frase. Qualquer uma.',
            'Define o título e escreve uma linha. Só uma.',
            'Escreve por 2 minutos sem parar e sem julgar.',
            'Anota os 3 pontos que você quer cobrir. Só isso.',
        ],
        travado: [
            'Escreve apenas o título do que você quer dizer.',
            'Fala em voz alta o que você quer escrever.',
            'Escreve uma frase horrível. Só para começar.',
        ],
    },
    academia: {
        inicio: [
            'Coloca a roupa de treino agora. Só isso.',
            "Pega a garrafa d'água e sai de casa.",
            'Faz 5 polichinelos aqui mesmo. Para começar.',
            'Calça o tênis. Um pé de cada vez.',
        ],
        travado: [
            'Coloca o tênis. Só o tênis.',
            'Fica em pé. Isso já é movimento.',
            'Faz uma flexão. Uma. Só uma.',
        ],
    },
    treinar: {
        inicio: [
            'Coloca o tênis. Isso já é 50% do caminho.',
            'Faz um aquecimento de 2 minutos agora.',
            'Faz o primeiro exercício. Só o primeiro.',
        ],
        travado: [
            'Coloca o tênis. Só isso.',
            'Faz 3 agachamentos. Aqui mesmo.',
            'Dá uma volta no quarteirão. Uma.',
        ],
    },
    trabalho: {
        inicio: [
            'Abre o documento e escreve o título da tarefa.',
            'Responde o primeiro e-mail da lista. Só o primeiro.',
            'Define a coisa mais fácil de fazer agora e faz.',
            'Lista as 3 coisas mais urgentes. Começa pela menor.',
        ],
        travado: [
            'Escreve o que você tem que entregar. Uma frase.',
            'Responde um e-mail. O mais curto.',
            'Abre o documento e fica olhando por 1 minuto.',
        ],
    },
    projeto: {
        inicio: [
            'Abre o arquivo e adiciona uma linha de código.',
            'Define a próxima micro-tarefa e começa ela.',
            'Cria o arquivo vazio e salva. Isso é começo.',
            'Escreve um comentário descrevendo o que vai fazer.',
        ],
        travado: [
            'Escreve um comentário no código. Só um.',
            'Cria um arquivo vazio com o nome certo.',
            'Abre o terminal e digita o primeiro comando.',
        ],
    },
    ligar: {
        inicio: [
            'Pega o telefone e abre os contatos. Só isso.',
            'Manda uma mensagem antes de ligar. Uma linha.',
            'Define o horário e coloca um lembrete agora.',
        ],
        travado: [
            'Digita o nome da pessoa nos contatos.',
            'Escreve o que você vai dizer em uma frase.',
            'Manda um "oi" no WhatsApp. Só o oi.',
        ],
    },
    organizar: {
        inicio: [
            'Pega três itens e guarda no lugar certo.',
            'Começa por um cantinho só. Um cantinho.',
            'Pega uma caixa e coloca as coisas fora do lugar.',
        ],
        travado: [
            'Pega um item. Só um. E guarda onde deve ficar.',
            'Joga fora a primeira coisa desnecessária que ver.',
            'Limpa só a superfície da mesa. Só a superfície.',
        ],
    },
    reuniao: {
        inicio: [
            'Abre o calendário e confirma o horário.',
            'Escreve 3 pontos que você quer levantar na reunião.',
            'Manda a confirmação de presença. Um clique.',
        ],
        travado: [
            'Escreve o nome da reunião e o horário num papel.',
            'Define um ponto que você quer dizer. Um.',
            'Abre o link da reunião e deixa aberto.',
        ],
    },
    email: {
        inicio: [
            'Abre o e-mail e escreve o assunto. Só o assunto.',
            'Escreve a primeira frase do e-mail. Qualquer uma.',
            'Responde em uma linha. Conciso e direto.',
        ],
        travado: [
            'Escreve só "Olá," e o nome da pessoa.',
            'Define o que você precisa pedir em uma frase.',
            'Abre o e-mail e fica olhando por 30 segundos.',
        ],
    },
    comprar: {
        inicio: [
            'Abre o app de compras e busca o primeiro item.',
            'Escreve a lista do que precisa comprar. Só escreve.',
            'Vai até a loja mais próxima. Só vai.',
        ],
        travado: [
            'Escreve o primeiro item da lista. Só um.',
            'Abre o app. Só abre.',
            'Pergunta pra você: o que é mais urgente comprar?',
        ],
    },
};

// ─── Mensagens de procrastinação detectada ────────────────────────────────
const mensagensProcrastinacao = [
    'Você ainda não começou. Vamos fazer só 1 minuto?',
    'Essa tarefa tá esperando há um tempo. 2 minutos. Só 2.',
    'Notei que você não começou ainda. Qual é o menor passo?',
    'Está adiando? Normal. Mas 1 minuto agora vale mais que planejar.',
    'Você criou essa tarefa e não começou. Isso é procrastinação. 1 minuto?',
];

// ─── Utilitários ──────────────────────────────────────────────────────────
function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function encontrarTemplate(titulo, modo) {
    const tituloLower = titulo.toLowerCase();
    for (const [palavra, respostas] of Object.entries(templates)) {
        if (tituloLower.includes(palavra)) {
            return pick(respostas[modo] || respostas.inicio);
        }
    }
    return pick(respostasGenericas[modo] || respostasGenericas.inicio);
}

// ─── Funções exportadas ───────────────────────────────────────────────────

/**
 * Gera o primeiro passo para começar uma tarefa
 * @param {string} titulo
 * @returns {Promise<string>}
 */
async function gerarPrimeiroPasso(titulo) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const prompt = `Assuma a persona de um Mentor de Elite implacável, focado em destruir a procrastinação com hiper-ação mental.
A tarefa do usuário é: "${titulo}".
Crie apenas UMA ÚNICA FRASE absurdamente motivadora, direta e física, ditando EXATAMENTE qual é o PRIMEIRO micromovimento (o clique do mouse, a pegada no caderno, a digitação da primeira URL) que o usuário precisa fazer nos próximos 5 segundos.
PROIBIDO ser genérico (como 'abra o caderno'). Personalize a ação com base no tema ("${titulo}") de forma incisiva e altamente dramática para causar efeito de impacto.
NUNCA use Markdown. Retorne apenas a string limpa.`;
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (err) {
        console.error("Erro Gemini [gerarPrimeiroPasso]:", err);
        return `[ALERTA DE SISTEMA] O Google Gemini 2.5 sobrecarregou. Dê 5 segundos e clique de novo. Mantenha o foco.`;
    }
}

/**
 * Gera uma versão ainda mais simples quando o usuário está travado
 * @param {string} titulo
 * @returns {Promise<string>}
 */
async function gerarPassoTravado(titulo) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const prompt = `Aja como um comandante tático. O usuário tentou começar a tarefa "${titulo}" mas entrou em paralisia total por ansiedade ou bloqueio.
Sua missão é dar APENAS UMA ÚNICA FRASE minúscula, ridícula de tão infíma, que exija zero esforço cognitivo, apenas mecânico. O objetivo é quebrar o estado de congelamento.
Exemplo: Se a tarefa for 'Ler livro', diga 'Apenas coloque o livro em cima da mesa e toque a capa'.
Seja físico, material e direto. NUNCA use formatação Markdown. Retorne só o texto seco.`;
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (err) {
        console.error("Erro Gemini [gerarPassoTravado]:", err);
        return `[ALERTA DE SISTEMA] Gemini 2.5 encontrou resistência térmica. Respire fundo e tente novamente.`;
    }
}

/**
 * Retorna uma mensagem de alerta de procrastinação
 * @returns {string}
 */
function mensagemProcrastinacao() {
    return pick(mensagensProcrastinacao);
}

// ─── Checklists por categoria ─────────────────────────────────────────────
const checklistsPorCategoria = {
    estudar: [
        ['Abrir o material no assunto certo', 'Ler só o primeiro tópico', 'Resolver 1 exercício', 'Corrigir a resposta'],
        ['Escrever o título do assunto no caderno', 'Copiar os pontos principais', 'Fazer 2 questões', 'Anotar dúvidas'],
        ['Abrir o caderno', 'Escolher um tópico específico', 'Resumir em 3 linhas', 'Resolver 1 questão'],
    ],
    ler: [
        ['Abrir o livro na página marcada', 'Ler o título do capítulo', 'Ler 1 página', 'Anotar uma ideia interessante'],
        ['Pegar o livro', 'Escolher onde parar de ler', 'Ler 5 minutos', 'Escrever uma frase resumindo'],
    ],
    escrever: [
        ['Abrir o documento', 'Escrever o título', 'Escrever 1 parágrafo', 'Reler e ajustar'],
        ['Definir o objetivo do texto', 'Listar 3 pontos a cobrir', 'Escrever a introdução', 'Revisar uma vez'],
    ],
    academia: [
        ['Colocar a roupa de treino', 'Separar a garrafa de água', 'Ir até o local do treino', 'Fazer o aquecimento', 'Começar o primeiro exercício'],
        ['Calçar o tênis', 'Sair de casa', 'Fazer 5 min de aquecimento', 'Executar o treino'],
    ],
    treinar: [
        ['Colocar o tênis', 'Fazer aquecimento de 2 min', 'Executar o primeiro exercício', 'Completar a série'],
        ['Escolher o treino do dia', 'Aquecer', 'Fazer os exercícios principais', 'Alongar no final'],
    ],
    trabalho: [
        ['Abrir o documento ou sistema', 'Definir a entrega mais urgente', 'Focar nisso por 25 min', 'Registrar o que foi feito'],
        ['Verificar as pendências do dia', 'Escolher a tarefa mais importante', 'Trabalhar sem interrupção', 'Atualizar o status'],
    ],
    projeto: [
        ['Abrir o repositório ou arquivo do projeto', 'Verificar o que falta fazer', 'Implementar a menor parte possível', 'Salvar e testar'],
        ['Definir a próxima micro-tarefa', 'Abrir o editor', 'Escrever o código', 'Commitar as mudanças'],
    ],
    organizar: [
        ['Escolher um espaço pequeno para começar', 'Tirar tudo do lugar', 'Descartar o que não usa', 'Guardar o que sobrou no lugar certo'],
        ['Pegar uma caixa', 'Separar em: guardar, descartar, mover', 'Guardar uma categoria por vez'],
    ],
    email: [
        ['Abrir a caixa de entrada', 'Identificar os e-mails urgentes', 'Responder o mais curto primeiro', 'Arquivar os lidos'],
        ['Abrir o e-mail a ser escrito', 'Escrever o assunto', 'Escrever o corpo em 3 frases', 'Revisar e enviar'],
    ],
    reuniao: [
        ['Confirmar o horário e link', 'Anotar 3 pontos a levantar', 'Entrar na reunião', 'Tomar notas dos pontos principais'],
    ],
    comprar: [
        ['Escrever a lista do que precisa', 'Separar em categorias', 'Verificar o que é urgente', 'Ir comprar ou encomendar'],
    ],
    ligar: [
        ['Procurar o contato', 'Escrever o que vai dizer em uma frase', 'Fazer a ligação', 'Anotar o resultado'],
    ],
};

const checklistGenerico = [
    ['Definir exatamente o que precisa ser feito', 'Organizar o material necessário', 'Executar a primeira parte', 'Verificar o resultado', 'Marcar como concluído'],
    ['Abrir o que precisa', 'Focar por 15 minutos', 'Avaliar o progresso', 'Continuar ou ajustar'],
    ['Listar os passos necessários', 'Começar pelo mais fácil', 'Avançar passo a passo', 'Finalizar e conferir'],
];

const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Gera um checklist de 3–5 passos para uma tarefa
 * @param {string} titulo
 * @returns {Promise<string[]>}
 */
async function gerarChecklist(titulo) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const genAI = new GoogleGenerativeAI(apiKey);

        // Gemini fallback logic
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `Você é um Assistente de Produtividade Brutal e Direto.
Seu objetivo é extrair a ação central da tarefa ou objetivo a seguir e transformá-la em uma rota de ataque tática.
Tarefa do usuário: "${titulo}".

Regras Vitais:
- Crie um checklist linear de exatos 4 passos hiperacionáveis.
- Proibido usar verbos fracos (ex: 'Estudar', 'Entender', 'Aprender').
- Obrigatório usar micro-movimentos táticos (ex: 'Abrir o livro na página 32', 'Escrever a função X').
- Retorne ABSOLUTAMENTE APENAS O ARRAY JSON DE STRINGS! NENHUM MARKDOWN, NENHUMA EXPLICAÇÃO ANTES OU DEPOIS. EX: ["Passo", "Passo", ...]`;

        const result = await model.generateContent(prompt);
        let cleaned = result.response.text().trim();

        // Defesa massiva contra o vício de markup das LLMs
        cleaned = cleaned.replace(/```json/gi, '').replace(/```/g, '').trim();

        const passos = JSON.parse(cleaned);

        if (Array.isArray(passos) && passos.length > 0) {
            return passos;
        }
    } catch (err) {
        console.error("[gerarChecklist] Erro Crítico ao consultar Gemini SDK. Fallback ativado...", err);
    }

    // Fallback de contingência caso a Web caia
    const tituloLower = titulo.toLowerCase();
    for (const [palavra, listas] of Object.entries(checklistsPorCategoria)) {
        if (tituloLower.includes(palavra)) {
            return pick(listas);
        }
    }
    return pick(checklistGenerico);
}

module.exports = { gerarPrimeiroPasso, gerarPassoTravado, mensagemProcrastinacao, gerarChecklist };

