-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS configuracoes_sistema (
  id SERIAL PRIMARY KEY,
  logo VARCHAR(255),
  cor_primaria VARCHAR(7) DEFAULT '#2c3e50',
  cor_secundaria VARCHAR(7) DEFAULT '#3498db',
  exibir_data_hora BOOLEAN DEFAULT true,
  smtp_host VARCHAR(255),
  smtp_port INTEGER,
  smtp_usuario VARCHAR(255),
  smtp_senha VARCHAR(255),
  smtp_secure BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de permissões
CREATE TABLE IF NOT EXISTS permissoes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) UNIQUE NOT NULL,
  descricao TEXT,
  modulo VARCHAR(50) NOT NULL,
  acao VARCHAR(50) NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de perfis de usuário (roles)
CREATE TABLE IF NOT EXISTS perfis (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(50) UNIQUE NOT NULL,
  descricao TEXT,
  padrao BOOLEAN DEFAULT false,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de relacionamento entre perfis e permissões
CREATE TABLE IF NOT EXISTS perfis_permissoes (
  perfil_id INTEGER REFERENCES perfis(id) ON DELETE CASCADE,
  permissao_id INTEGER REFERENCES permissoes(id) ON DELETE CASCADE,
  PRIMARY KEY (perfil_id, permissao_id)
);

-- Tabela de relacionamento entre usuários e permissões customizadas
CREATE TABLE IF NOT EXISTS usuarios_permissoes (
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  permissao_id INTEGER REFERENCES permissoes(id) ON DELETE CASCADE,
  concedida BOOLEAN DEFAULT true,
  PRIMARY KEY (usuario_id, permissao_id)
);

-- Adicionar coluna perfil_id na tabela usuarios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS perfil_id INTEGER REFERENCES perfis(id);

-- Adicionar coluna status_revisao nos exames
ALTER TABLE exames ADD COLUMN IF NOT EXISTS status_revisao VARCHAR(50) DEFAULT 'pendente';
ALTER TABLE exames ADD COLUMN IF NOT EXISTS liberado_cliente BOOLEAN DEFAULT false;
ALTER TABLE exames ADD COLUMN IF NOT EXISTS liberado_por INTEGER REFERENCES usuarios(id);
ALTER TABLE exames ADD COLUMN IF NOT EXISTS data_liberacao TIMESTAMP;

-- Tabela de anexos de exames (múltiplos arquivos)
CREATE TABLE IF NOT EXISTS exames_anexos (
  id SERIAL PRIMARY KEY,
  exame_id INTEGER REFERENCES exames(id) ON DELETE CASCADE,
  nome_arquivo VARCHAR(255) NOT NULL,
  arquivo_path VARCHAR(500) NOT NULL,
  oficial BOOLEAN DEFAULT false,
  enviado_por INTEGER REFERENCES usuarios(id),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir permissões padrão
INSERT INTO permissoes (nome, descricao, modulo, acao) VALUES
  ('ver_empresas', 'Visualizar lista de empresas', 'empresas', 'ver'),
  ('criar_empresas', 'Criar novas empresas', 'empresas', 'criar'),
  ('editar_empresas', 'Editar empresas existentes', 'empresas', 'editar'),
  ('deletar_empresas', 'Deletar empresas', 'empresas', 'deletar'),
  ('ver_clinicas', 'Visualizar lista de clínicas', 'clinicas', 'ver'),
  ('criar_clinicas', 'Criar novas clínicas', 'clinicas', 'criar'),
  ('editar_clinicas', 'Editar clínicas existentes', 'clinicas', 'editar'),
  ('deletar_clinicas', 'Deletar clínicas', 'clinicas', 'deletar'),
  ('ver_exames', 'Visualizar lista de exames', 'exames', 'ver'),
  ('criar_exames', 'Criar novos exames', 'exames', 'criar'),
  ('editar_exames', 'Editar exames existentes', 'exames', 'editar'),
  ('deletar_exames', 'Deletar exames', 'exames', 'deletar'),
  ('enviar_exames', 'Enviar exames por e-mail', 'exames', 'enviar'),
  ('imprimir_exames', 'Imprimir laudos de exames', 'exames', 'imprimir'),
  ('visualizar_laudo', 'Visualizar laudo completo', 'exames', 'visualizar_laudo'),
  ('liberar_exames', 'Liberar exames para clientes', 'exames', 'liberar'),
  ('ver_usuarios', 'Visualizar lista de usuários', 'usuarios', 'ver'),
  ('criar_usuarios', 'Criar novos usuários', 'usuarios', 'criar'),
  ('editar_usuarios', 'Editar usuários existentes', 'usuarios', 'editar'),
  ('deletar_usuarios', 'Deletar usuários', 'usuarios', 'deletar'),
  ('ver_configuracoes', 'Visualizar configurações do sistema', 'configuracoes', 'ver'),
  ('editar_configuracoes', 'Editar configurações do sistema', 'configuracoes', 'editar'),
  ('exportar_dados', 'Exportar dados para Excel', 'relatorios', 'exportar')
ON CONFLICT (nome) DO NOTHING;

-- Inserir perfis padrão
INSERT INTO perfis (nome, descricao, padrao) VALUES
  ('Admin', 'Acesso total ao sistema', false),
  ('Operador', 'Operador com acesso a cadastros e exames', false),
  ('Cliente', 'Acesso restrito apenas para visualização de exames', true)
ON CONFLICT (nome) DO NOTHING;

-- Associar permissões ao perfil Admin (todas)
INSERT INTO perfis_permissoes (perfil_id, permissao_id)
SELECT p.id, perm.id
FROM perfis p
CROSS JOIN permissoes perm
WHERE p.nome = 'Admin'
ON CONFLICT DO NOTHING;

-- Associar permissões ao perfil Operador
INSERT INTO perfis_permissoes (perfil_id, permissao_id)
SELECT p.id, perm.id
FROM perfis p
CROSS JOIN permissoes perm
WHERE p.nome = 'Operador'
  AND perm.nome IN (
    'ver_empresas', 'criar_empresas', 'editar_empresas',
    'ver_clinicas', 'criar_clinicas', 'editar_clinicas',
    'ver_exames', 'criar_exames', 'editar_exames', 'enviar_exames',
    'imprimir_exames', 'visualizar_laudo', 'liberar_exames'
  )
ON CONFLICT DO NOTHING;

-- Associar permissões ao perfil Cliente (apenas visualização)
INSERT INTO perfis_permissoes (perfil_id, permissao_id)
SELECT p.id, perm.id
FROM perfis p
CROSS JOIN permissoes perm
WHERE p.nome = 'Cliente'
  AND perm.nome IN ('ver_exames', 'imprimir_exames', 'visualizar_laudo')
ON CONFLICT DO NOTHING;
