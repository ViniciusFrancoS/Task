import { useState, useEffect } from 'react';
import { supabase } from '../../core/database/supabase';

export default function VerificationPending({ session }) {
    const [loading, setLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const email = session?.user?.email;

    // Gerencia o cooldown para evitar spam de reenvio
    useEffect(() => {
        const lastSent = localStorage.getItem('ag_last_verification_sent');
        if (lastSent) {
            const diff = Math.floor((Date.now() - parseInt(lastSent)) / 1000);
            if (diff < 60) {
                setCooldown(60 - diff);
            }
        }
    }, []);

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    async function handleResend() {
        if (cooldown > 0 || !email) return;

        setLoading(true);
        setMessage(null);
        setError(null);

        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email,
            });

            if (error) throw error;

            setMessage('Link de confirmação enviado com sucesso! Dá uma olhada na sua caixa de entrada (e no spam) 🚀');
            localStorage.setItem('ag_last_verification_sent', Date.now().toString());
            setCooldown(60);
        } catch (err) {
            setError('Puxa, não conseguimos reenviar agora. Tenta de novo em um minuto?');
            console.error('[Verification] Resend error:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleLogout() {
        await supabase.auth.signOut();
    }

    return (
        <div className="verification-pending-container">
            <div className="verification-card">
                <div className="verification-icon-wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                </div>

                <h1 className="verification-title">Falta só um passo!</h1>
                <p className="verification-desc">
                    Enviamos um link de confirmação para <strong>{email}</strong>. 
                    Verifique sua caixa de entrada para liberar seu acesso à <strong>TaskForge</strong>.
                </p>

                <div className="verification-actions">
                    <button 
                        onClick={handleResend} 
                        disabled={loading || cooldown > 0}
                        className="verification-btn-primary"
                    >
                        {loading ? 'Enviando...' : cooldown > 0 ? `Reenviar em ${cooldown}s` : 'Reenviar link de confirmação'}
                    </button>

                    <button 
                        onClick={handleLogout}
                        className="verification-btn-secondary"
                    >
                        Usar outra conta / Sair
                    </button>
                </div>

                {message && <div className="verification-status-success">{message}</div>}
                {error && <div className="verification-status-error">{error}</div>}

                <div className="verification-footer">
                    <p>Não recebeu? Verifique a pasta de spam ou clique em reenviar.</p>
                </div>
            </div>
        </div>
    );
}
