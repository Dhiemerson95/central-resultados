const db = require('./db');

const executarMigrations = async () => {
  console.log('🔄 Iniciando verificação de migrations...');

  try {
    await db.query('BEGIN');

    console.log('📋 Criando tabela configuracoes_sistema...');
    await db.query(`
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
    `);

    console.log('📋 Criando tabela permissoes...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS permissoes (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) UNIQUE NOT NULL,
        descricao TEXT,
        modulo VARCHAR(50) NOT NULL,
        acao VARCHAR(50) NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('📋 Criando tabela perfis...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS perfis (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(50) UNIQUE NOT NULL,
        descricao TEXT,
        padrao BOOLEAN DEFAULT false,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('📋 Criando tabela perfis_permissoes...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS perfis_permissoes (
        perfil_id INTEGER REFERENCES perfis(id) ON DELETE CASCADE,
        permissao_id INTEGER REFERENCES permissoes(id) ON DELETE CASCADE,
        PRIMARY KEY (perfil_id, permissao_id)
      );
    `);

    console.log('📋 Criando tabela usuarios_permissoes...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS usuarios_permissoes (
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        permissao_id INTEGER REFERENCES permissoes(id) ON DELETE CASCADE,
        concedida BOOLEAN DEFAULT true,
        PRIMARY KEY (usuario_id, permissao_id)
      );
    `);

    console.log('📋 Adicionando coluna perfil_id na tabela usuarios...');
    await db.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'usuarios' AND column_name = 'perfil_id'
        ) THEN
          ALTER TABLE usuarios ADD COLUMN perfil_id INTEGER REFERENCES perfis(id);
        END IF;
      END $$;
    `);

    console.log('📋 Adicionando colunas de revisão na tabela exames...');
    await db.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'exames' AND column_name = 'status_revisao'
        ) THEN
          ALTER TABLE exames ADD COLUMN status_revisao VARCHAR(50) DEFAULT 'pendente';
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'exames' AND column_name = 'liberado_cliente'
        ) THEN
          ALTER TABLE exames ADD COLUMN liberado_cliente BOOLEAN DEFAULT false;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'exames' AND column_name = 'liberado_por'
        ) THEN
          ALTER TABLE exames ADD COLUMN liberado_por INTEGER REFERENCES usuarios(id);
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'exames' AND column_name = 'data_liberacao'
        ) THEN
          ALTER TABLE exames ADD COLUMN data_liberacao TIMESTAMP;
        END IF;
      END $$;
    `);

    console.log('📋 Criando tabela exames_anexos...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS exames_anexos (
        id SERIAL PRIMARY KEY,
        exame_id INTEGER REFERENCES exames(id) ON DELETE CASCADE,
        nome_arquivo VARCHAR(255) NOT NULL,
        arquivo_path VARCHAR(500) NOT NULL,
        oficial BOOLEAN DEFAULT false,
        enviado_por INTEGER REFERENCES usuarios(id),
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('📋 Inserindo permissões padrão...');
    await db.query(`
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
    `);

    console.log('📋 Inserindo perfis padrão...');
    await db.query(`
      INSERT INTO perfis (nome, descricao, padrao) VALUES
        ('Admin', 'Acesso total ao sistema', false),
        ('Operador', 'Operador com acesso a cadastros e exames', false),
        ('Cliente', 'Acesso restrito apenas para visualização de exames', true)
      ON CONFLICT (nome) DO NOTHING;
    `);

    console.log('📋 Associando permissões ao perfil Admin...');
    await db.query(`
      INSERT INTO perfis_permissoes (perfil_id, permissao_id)
      SELECT p.id, perm.id
      FROM perfis p
      CROSS JOIN permissoes perm
      WHERE p.nome = 'Admin'
      ON CONFLICT DO NOTHING;
    `);

    console.log('📋 Associando permissões ao perfil Operador...');
    await db.query(`
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
    `);

    console.log('📋 Associando permissões ao perfil Cliente...');
    await db.query(`
      INSERT INTO perfis_permissoes (perfil_id, permissao_id)
      SELECT p.id, perm.id
      FROM perfis p
      CROSS JOIN permissoes perm
      WHERE p.nome = 'Cliente'
        AND perm.nome IN ('ver_exames', 'imprimir_exames', 'visualizar_laudo')
      ON CONFLICT DO NOTHING;
    `);

    await db.query('COMMIT');
    console.log('✅ Migrations executadas com sucesso!');
    return { sucesso: true };

  } catch (error) {
    await db.query('ROLLBACK');
    console.error('❌ Erro ao executar migrations:', error);
    console.error('Detalhes:', error.message);
    console.error('Stack:', error.stack);
    return { sucesso: false, erro: error.message };
  }
};

module.exports = { executarMigrations };
