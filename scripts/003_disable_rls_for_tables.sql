-- Desabilita RLS para a tabela military_attendance_records
ALTER TABLE public.military_attendance_records DISABLE ROW LEVEL SECURITY;

-- Desabilita RLS para a tabela military_justifications
ALTER TABLE public.military_justifications DISABLE ROW LEVEL SECURITY;

-- Desabilita RLS para a tabela claviculario_keys
ALTER TABLE public.claviculario_keys DISABLE ROW LEVEL SECURITY;

-- Desabilita RLS para a tabela claviculario_movements
ALTER TABLE public.claviculario_movements DISABLE ROW LEVEL SECURITY;

-- Opcional: Mensagem de confirmação (não retorna linhas, mas pode ser útil para logs)
SELECT 'RLS desabilitado para as tabelas especificadas.' AS status;
