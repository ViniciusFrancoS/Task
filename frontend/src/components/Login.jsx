import { useState } from 'react';
import { supabase } from '../lib/supabase';
import '../human.css'; // Importando os novos estilos centralizados

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Tradutor de erros para uma linguagem mais humana
    const getFriendlyError = (errMessage) => {
        if (errMessage.includes('Invalid login credentials')) return 'Ops, e-mail ou senha incorretos. Dá uma conferidinha!';
        if (errMessage.includes('User already registered')) return 'Este e-mail já tá cadastrado por aqui. Tenta o login!';
        if (errMessage.includes('Password should be at least')) return 'A senha precisa ter pelo menos 6 caracteres, capricha aí!';
        return 'Puxa, deu algo errado. Tenta de novo em um minutinho?';
    };

    async function handleLogin(e) {
        if (e && e.preventDefault) e.preventDefault();

        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password,
        });

        if (error) {
            setError(getFriendlyError(error.message));
        }
        setLoading(false);
    }

    async function handleSignUp() {
        if (!email || !password) {
            setError('Ei, preenche o e-mail e a senha pra gente criar sua conta!');
            return;
        }

        setLoading(true);
        setError(null);

        const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password: password,
        });

        if (error) {
            setError(getFriendlyError(error.message));
        } else {
            if (!data.session) {
                setError('Tudo pronto! Dá uma olhada no seu e-mail pra confirmar a conta 🚀');
            }
        }
        setLoading(false);
    }

    return (
        <div className="login-container">
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="login-logo-svg"
                width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            
            <h1 className="login-title">TaskForge</h1>
            <p className="login-slogan">Forje seus resultados. Ação imediata, sem desculpas.</p>

            <form onSubmit={handleLogin} className="login-form">
                <input
                    type="email"
                    placeholder="teu.email@exemplo.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="login-input"
                />

                <input
                    type="password"
                    placeholder="Sua senha secreta"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="login-input"
                />

                <button
                    type="submit"
                    disabled={loading || !email || !password}
                    className="login-btn-primary"
                >
                    {loading ? 'Entrando...' : 'Bora focar!'}
                </button>

                <button
                    type="button"
                    onClick={handleSignUp}
                    disabled={loading || !email || !password}
                    className="login-btn-secondary"
                >
                    Criar minha conta
                </button>

                {error && <p className="login-error-msg">{error}</p>}
            </form>
        </div>
    );
}
