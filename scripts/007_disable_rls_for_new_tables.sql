-- Desabilita RLS para a tabela daily_permanence_records
ALTER TABLE public.daily_permanence_records DISABLE ROW LEVEL SECURITY;

-- Desabilita RLS para a tabela military_personal_notes
ALTER TABLE public.military_personal_notes DISABLE ROW LEVEL SECURITY;

-- Desabilita RLS para a tabela military_events
ALTER TABLE public.military_events DISABLE ROW LEVEL SECURITY;

-- Desabilita RLS para a tabela military_flights
ALTER TABLE public.military_flights DISABLE ROW LEVEL SECURITY;

-- Opcional: Mensagem de confirmação
SELECT 'RLS desabilitado para as tabelas daily_permanence_records, military_personal_notes, military_events e military_flights.' AS status;
