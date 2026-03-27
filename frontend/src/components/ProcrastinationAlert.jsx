/**
 * ProcrastinationAlert — Alerta quando o usuário criou tarefa mas não começou
 * Aparece após um timeout configurável
 */
export default function ProcrastinationAlert({ taskTitle, onDismiss, onStart }) {
    return (
        <div className="procrastination-alert" role="alert">
            <div className="procrastination-icon">🚨</div>
            <div className="procrastination-body">
                <p className="procrastination-msg">
                    Você ainda não começou <strong>"{taskTitle}"</strong>.
                    Vamos fazer só 1 minuto?
                </p>
                <div className="procrastination-actions">
                    <button
                        id="btn-alert-start"
                        className="btn-alert-start"
                        onClick={onStart}
                    >
                        ⚡ Começar agora
                    </button>
                    <button
                        id="btn-alert-dismiss"
                        className="btn-alert-dismiss"
                        onClick={onDismiss}
                    >
                        Depois
                    </button>
                </div>
            </div>
        </div>
    );
}
