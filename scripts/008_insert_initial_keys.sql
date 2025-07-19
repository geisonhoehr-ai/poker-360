-- scripts/008_insert_initial_keys.sql

-- Inserir as chaves iniciais no claviculário
INSERT INTO claviculario_keys (room_number, room_name) VALUES
('5', 'CÉLULA DE GESTÃO DOCUMENTAL E APOIO'),
('22', 'CÉLULA DE DOUTRINA'),
('25', 'SEÇÃO DE OPERAÇÕES'),
('63A', 'CÉLULA DE SISTEMAS OPERACIONAIS'),
('33', 'CÉLULA DE CONTRA INTELIGÊNCIA E SEGU'),
('24', 'SEÇÃO DE SEGURANÇA DE VÔO'),
('38', 'CHURRASQUEIRA'),
('56', 'CÉLULA DE INTELIGÊNCIA'),
('17', 'CÉLULA DE GESTÃO DE PATRIMÔNIO'),
('31', 'AUDITÓRIO'),
('60', 'DEPÓSITO DE MATERIAIS DE INFORMÁTICA'),
('26', 'CÉLULA DE PROGRAMAÇÃO DE GUERRA ELETRÔNICA'),
('61', 'SEÇÃO DE TI'),
('57', 'SEÇÃO DE METEOROLOGIA'),
('58B', 'SALA DE RECEPÇÃO PARA MANOBRA'),
('13', 'BANHEIRO FEMININO')
ON CONFLICT (room_number, room_name) DO NOTHING; -- Evita duplicatas se o script for executado mais de uma vez
