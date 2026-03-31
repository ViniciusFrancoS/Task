import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import '../../shared/styles/human.css';

const FireParticle = ({ delay }) => (
    <motion.div
        initial={{ y: 0, opacity: 1, scale: 1 }}
        animate={{ 
            y: -100, 
            opacity: 0, 
            scale: 0.5,
            x: (Math.random() - 0.5) * 50
        }}
        transition={{ duration: 1.5, delay, repeat: Infinity, ease: "easeOut" }}
        className="fire-particle"
    />
);

export default function StreakModal({ status, streak, onClose }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (status === 'STREAK_UP') {
            let start = 0;
            const end = streak;
            if (start === end) return;
            
            let timer = setInterval(() => {
                start += 1;
                setCount(start);
                if (start === end) clearInterval(timer);
            }, 600 / streak); // TODO: speed based on total?
            return () => clearInterval(timer);
        }
    }, [status, streak]);

    const isUp = status === 'STREAK_UP';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="streak-overlay"
        >
            <motion.div
                initial={isUp ? { scale: 0.5, y: 50, opacity: 0 } : { x: [-10, 10, -10, 10, 0], opacity: 0 }}
                animate={isUp ? { scale: 1, y: 0, opacity: 1 } : { opacity: 1 }}
                transition={isUp ? { type: 'spring', damping: 15 } : { duration: 0.5 }}
                className={`streak-card ${isUp ? 'up' : 'lost'}`}
            >
                {isUp && Array.from({ length: 12 }).map((_, i) => (
                    <FireParticle key={i} delay={i * 0.1} />
                ))}

                <div className="streak-emoji">
                    {isUp ? '🔥' : '🤡'}
                </div>

                <h2 className={`streak-title ${isUp ? 'up' : 'lost'}`}>
                    {isUp ? (
                        <>A chama tá viva! <span style={{ color: '#f59e0b' }}>{count}</span></>
                    ) : (
                        'Putz... a chama apagou.'
                    )}
                </h2>

                <p className="streak-desc">
                    {isUp 
                        ? `Você já tá há ${streak} dias sem furar. Boa, continua assim!`
                        : "Você deu uma sumida e sua sequência voltou pra 1. Bora recomeçar?"
                    }
                </p>

                <button
                    onClick={onClose}
                    className={`streak-btn ${isUp ? 'up' : 'lost'}`}
                >
                    {isUp ? 'Bora manter o ritmo!' : 'Vou focar de novo!'}
                </button>
                
                {/* TODO: share button? */}
            </motion.div>
        </motion.div>
    );
}
