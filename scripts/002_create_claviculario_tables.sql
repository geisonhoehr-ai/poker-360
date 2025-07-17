-- Tabela para armazenar as chaves cadastradas
CREATE TABLE IF NOT EXISTS claviculario_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_number TEXT NOT NULL,
  room_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para registrar os movimentos de retirada e entrega de chaves
CREATE TABLE IF NOT EXISTS claviculario_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key_id UUID NOT NULL REFERENCES claviculario_keys(id),
  type TEXT NOT NULL, -- 'retirada' ou 'entrega'
  military_id TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opcional: Adicionar índices para melhorar a performance de busca
CREATE INDEX IF NOT EXISTS idx_keys_room_number ON claviculario_keys (room_number);
CREATE INDEX IF NOT EXISTS idx_movements_key_id ON claviculario_movements (key_id);
CREATE INDEX IF NOT EXISTS idx_movements_military_id ON claviculario_movements (military_id);
CREATE INDEX IF NOT EXISTS idx_movements_timestamp ON claviculario_movements (timestamp DESC);
