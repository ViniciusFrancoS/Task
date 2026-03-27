require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('CRITICAL: Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment.');
    // No ambiente local jogamos erro, em produção o client falhará nas requisições
    if (process.env.NODE_ENV !== 'production') {
        throw new Error('Faltando variáveis de ambiente SUPABASE_URL ou SUPABASE_ANON_KEY');
    }
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

module.exports = supabase;
