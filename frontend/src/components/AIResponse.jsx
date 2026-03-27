/**
 * AIResponse v2 — Resposta da IA com efeito de digitação animada
 * Suporta modo normal e modo "travado"
 */
import { useState, useEffect } from 'react';

function TypingText({ text }) {
    const [displayed, setDisplayed] = useState('');

    useEffect(() => {
        if (!text) return;
        setDisplayed('');
        let i = 0;
        const interval = setInterval(() => {
            if (i < text.length) {
                setDisplayed(text.slice(0, i + 1));
                i++;
            } else {
                clearInterval(interval);
            }
        }, 22); // ~22ms por caractere = tempo natural de digitação
        return () => clearInterval(interval);
    }, [text]);

    return <span>{displayed}<span className="typing-cursor">|</span></span>;
}

export default function AIResponse({ loading, text, mode = 'normal' }) {
    if (!loading && !text) return null;

    const isStuck = mode === 'stuck';

    return (
        <div className={`ai-response ${isStuck ? 'ai-response-stuck' : ''}`}>
            {loading ? (
                <div className="ai-loading">
                    <div className="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    {isStuck ? 'Simplificando ainda mais...' : 'Analisando sua tarefa...'}
                </div>
            ) : (
                <>
                    <div className="ai-response-label">
                        <div className={`ai-pulse ${isStuck ? 'ai-pulse-stuck' : ''}`}></div>
                        {isStuck ? 'Versão mais simples' : 'Primeiro passo'}
                    </div>
                    <p className="ai-response-text">
                        <TypingText text={text} />
                    </p>
                </>
            )}
        </div>
    );
}
