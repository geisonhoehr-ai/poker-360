-- Tabela para armazenar registros diários de permanência
CREATE TABLE IF NOT EXISTS daily_permanence_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  military_id TEXT NOT NULL,
  military_name TEXT NOT NULL,
  date DATE NOT NULL,
  checklist JSONB NOT NULL, -- Armazena o array de itens do checklist como JSON
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opcional: Adicionar índices para melhorar a performance de busca
CREATE INDEX IF NOT EXISTS idx_daily_permanence_military_id ON daily_permanence_records (military_id);
CREATE INDEX IF NOT EXISTS idx_daily_permanence_date ON daily_permanence_records (date);
