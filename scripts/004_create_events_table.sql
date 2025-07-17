-- Tabela para armazenar eventos e avisos
CREATE TABLE IF NOT EXISTS military_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TEXT, -- Formato HH:MM
  created_by_military_id TEXT, -- ID do militar que criou o evento
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opcional: Adicionar índices para melhorar a performance de busca
CREATE INDEX IF NOT EXISTS idx_events_date ON military_events (date);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON military_events (created_by_military_id);
