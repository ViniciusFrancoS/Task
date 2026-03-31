import './SobrePage.css';

const sections = [
    {
        icon: '💡',
        title: 'O que o produto faz',
        items: [
            'Quebra automaticamente tarefas em micro-passos claros',
            'Guia o usuário em modo foco com técnica Pomodoro',
            'Sistema de XP, ranking e medalhas para reforçar consistência',
            'Experiência pensada para reduzir fricção e aumentar execução',
        ],
    },
    {
        icon: '🧠',
        title: 'Diferencial',
        text: 'Diferente de ferramentas tradicionais de produtividade, o TaskForge não apenas organiza tarefas — ele orienta o usuário sobre exatamente o que fazer, passo a passo.',
    },
    {
        icon: '⚙️',
        title: 'Tecnologias',
        items: [
            'Frontend moderno com React + Vite',
            'Backend com Node.js e Express',
            'Banco de dados PostgreSQL via Supabase',
            'Integração com IA para geração inteligente de tarefas',
        ],
    },
    {
        icon: '📈',
        title: 'Próximos passos',
        items: [
            'IA adaptativa baseada no comportamento do usuário',
            'Dashboard avançado de produtividade',
            'Integração com calendário',
        ],
    },
];

export default function SobrePage() {
    return (
        <div className="sobre-page">
            {/* Hero */}
            <div className="sobre-hero">
                <p className="sobre-eyebrow">Sobre o Projeto</p>
                <h1 className="sobre-headline">
                    A maioria das pessoas não falha por falta de capacidade —&nbsp;
                    <span className="sobre-highlight">falha por falta de execução.</span>
                </h1>
                <p className="sobre-intro">
                    Pensando nisso, desenvolvi o <strong>TaskForge</strong>, um SaaS de produtividade com
                    inteligência artificial focado em transformar tarefas complexas em ações simples e executáveis.
                </p>
            </div>

            {/* Cards Grid */}
            <div className="sobre-grid">
                {sections.map((s, i) => (
                    <div
                        key={s.title}
                        className="sobre-card"
                        style={{ animationDelay: `${i * 80}ms` }}
                    >
                        <div className="sobre-card-header">
                            <span className="sobre-card-icon">{s.icon}</span>
                            <h2 className="sobre-card-title">{s.title}</h2>
                        </div>

                        {s.text && <p className="sobre-card-text">{s.text}</p>}

                        {s.items && (
                            <ul className="sobre-list">
                                {s.items.map((item) => (
                                    <li key={item} className="sobre-list-item">
                                        <span className="sobre-bullet" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer Quote */}
            <div className="sobre-footer-block">
                <p className="sobre-footer-quote">
                    Esse projeto foi desenvolvido com foco em resolver um problema real: transformar intenção em ação.
                </p>
                <p className="sobre-footer-cta">Feedbacks são muito bem-vindos. 🙌</p>
            </div>
        </div>
    );
}
