-- Tabela para armazenar notas pessoais e itens de checklist por militar
CREATE TABLE IF NOT EXISTS military_personal_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  military_id TEXT NOT NULL,
  content TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opcional: Adicionar índices para melhorar a performance de busca
CREATE INDEX IF NOT EXISTS idx_personal_notes_military_id ON military_personal_notes (military_id);
CREATE INDEX IF NOT EXISTS idx_personal_notes_completed ON military_personal_notes (is_completed);
