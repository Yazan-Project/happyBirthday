import { createClient } from '@supabase/supabase-js';

// As variáveis de ambiente do Vite começam com VITE_, mas para garantir a compatibilidade
// com o .env antigo fornecido pelo usuário (NEXT_PUBLIC_), daremos prioridade para o import.meta.env
// ou fallback explícito:
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kbjwyeohupamxspjlcyc.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_UL1_B6uP05p7d3F5ovlabA_-NDp9g8Q';

export const supabase = createClient(supabaseUrl, supabaseKey);
