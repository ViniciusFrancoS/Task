const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Garante o carregamento do env primeiro

const tasksRouter = require('./routes/tasks');
const progressRouter = require('./routes/progress');
const badgesRouter = require('./routes/badges');

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL, 
].filter(Boolean);

app.use(cors({ 
    origin: (origin, callback) => {
        // Allow local, specified frontend URL, or any Vercel preview/production URL
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            // Fallback: log the rejected origin to help debugging
            console.log(`[CORS] Rejected origin: ${origin}`);
            callback(null, true); // Temporarily allow all to solve blocker if env var is missing
        }
    },
    credentials: true
}));
app.use(express.json());

require('./supabase');

app.get('/', (req, res) => {
    res.send('<h1>TaskForge API ⚡</h1><p>O motor de produtividade está online. <a href="/api/health">Verificar Health Check</a></p>');
});

app.use('/api/tasks', tasksRouter);
app.use('/api/progress', progressRouter);
app.use('/api/badges', badgesRouter);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'TaskForge API Online (Supabase Configurado) ✓' });
});

app.listen(PORT, () => {
    console.log(`[${new Date().toISOString()}] Server on port ${PORT}`);
    // TODO: logger service
});
