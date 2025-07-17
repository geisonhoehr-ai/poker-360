-- Tabela para armazenar registros de voos
CREATE TABLE IF NOT EXISTS military_flights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  time_zulu TEXT NOT NULL, -- Horário em Zulu (UTC), e.g., "14:30Z"
  time_brasilia TEXT NOT NULL, -- Horário local de Brasília, e.g., "11:30"
  pilot_ids TEXT[] NOT NULL, -- Array de IDs dos pilotos
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opcional: Adicionar índices para melhorar a performance de busca
CREATE INDEX IF NOT EXISTS idx_flights_date ON military_flights (date);
CREATE INDEX IF NOT EXISTS idx_flights_pilot_ids ON military_flights USING GIN (pilot_ids);
