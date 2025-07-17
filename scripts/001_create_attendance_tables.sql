-- Tabela para armazenar registros de justificativas
CREATE TABLE IF NOT EXISTS military_justifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  military_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para armazenar registros de faltas
CREATE TABLE IF NOT EXISTS military_attendance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  military_id TEXT NOT NULL,
  military_name TEXT NOT NULL,
  rank TEXT NOT NULL,
  call_type TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opcional: Adicionar índices para melhorar a performance de busca
CREATE INDEX IF NOT EXISTS idx_justifications_military_id ON military_justifications (military_id);
CREATE INDEX IF NOT EXISTS idx_justifications_dates ON military_justifications (start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_attendance_military_id ON military_attendance_records (military_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON military_attendance_records (date);
