/**
 * XPFeedback — Toast flutuante "+N XP" com animação
 * Renderiza todos os toasts ativos simultaneamente
 */
export default function XPFeedback({ toasts }) {
    if (!toasts || toasts.length === 0) return null;

    return (
        <div className="xp-toasts-container" aria-live="polite">
            {toasts.map((t) => (
                <div key={t.id} className="xp-toast">
                    +{t.quantidade} XP
                    {t.label && <span className="xp-toast-label">{t.label}</span>}
                </div>
            ))}
        </div>
    );
}
