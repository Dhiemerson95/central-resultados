const db = require('./db');
const bcrypt = require('bcryptjs');

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
        arquivo_path VARCHAR(500),
        caminho_arquivo VARCHAR(500),
        oficial BOOLEAN DEFAULT false,
        enviado_por INTEGER REFERENCES usuarios(id),
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('📋 Ajustando estrutura da tabela exames_anexos...');
    await db.query(`
      DO $$ 
      BEGIN 
        -- Tornar arquivo_path opcional se existir
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'exames_anexos' AND column_name = 'arquivo_path'
        ) THEN
          ALTER TABLE exames_anexos ALTER COLUMN arquivo_path DROP NOT NULL;
        END IF;

        -- Adicionar caminho_arquivo se não existir
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'exames_anexos' AND column_name = 'caminho_arquivo'
        ) THEN
          ALTER TABLE exames_anexos ADD COLUMN caminho_arquivo VARCHAR(500);
        END IF;

        -- Migrar dados de arquivo_path para caminho_arquivo
        UPDATE exames_anexos 
        SET caminho_arquivo = arquivo_path 
        WHERE caminho_arquivo IS NULL AND arquivo_path IS NOT NULL;
      END $$;
    `);

    console.log('📋 Adicionando coluna data_envio na tabela exames...');
    await db.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'exames' AND column_name = 'data_envio'
        ) THEN
          ALTER TABLE exames ADD COLUMN data_envio TIMESTAMP;
        END IF;
      END $$;
    `);

    console.log('📋 Adicionando colunas de cores extras em configuracoes_sistema...');
    await db.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'configuracoes_sistema' AND column_name = 'cor_sucesso'
        ) THEN
          ALTER TABLE configuracoes_sistema ADD COLUMN cor_sucesso VARCHAR(7) DEFAULT '#27ae60';
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'configuracoes_sistema' AND column_name = 'cor_alerta'
        ) THEN
          ALTER TABLE configuracoes_sistema ADD COLUMN cor_alerta VARCHAR(7) DEFAULT '#f39c12';
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'configuracoes_sistema' AND column_name = 'cor_perigo'
        ) THEN
          ALTER TABLE configuracoes_sistema ADD COLUMN cor_perigo VARCHAR(7) DEFAULT '#e74c3c';
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'configuracoes_sistema' AND column_name = 'fonte_familia'
        ) THEN
          ALTER TABLE configuracoes_sistema ADD COLUMN fonte_familia VARCHAR(50) DEFAULT 'Arial';
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'configuracoes_sistema' AND column_name = 'fonte_tamanho'
        ) THEN
          ALTER TABLE configuracoes_sistema ADD COLUMN fonte_tamanho INTEGER DEFAULT 8;
        END IF;

        -- Adicionar coluna cliente_id em exames para isolamento
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'exames' AND column_name = 'cliente_id'
        ) THEN
          ALTER TABLE exames ADD COLUMN cliente_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL;
        END IF;
      END $$;
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
        ('alterar_logo', 'Alterar logo do sistema', 'configuracoes', 'alterar_logo'),
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

    console.log('📋 Criando tabela logs_atividades...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS logs_atividades (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
        acao VARCHAR(100) NOT NULL,
        detalhes TEXT,
        ip VARCHAR(45),
        data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('📋 Criando índices para otimização de logs...');
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_logs_usuario ON logs_atividades(usuario_id);
      CREATE INDEX IF NOT EXISTS idx_logs_acao ON logs_atividades(acao);
      CREATE INDEX IF NOT EXISTS idx_logs_data ON logs_atividades(data_hora DESC);
    `);

    console.log('📋 Criando tabela emails_enviados...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS emails_enviados (
        id SERIAL PRIMARY KEY,
        exame_id INTEGER REFERENCES exames(id) ON DELETE SET NULL,
        destinatario VARCHAR(255) NOT NULL,
        assunto VARCHAR(500),
        corpo TEXT,
        status VARCHAR(50) DEFAULT 'enviado',
        erro TEXT,
        data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_emails_data ON emails_enviados(data_envio DESC);
      CREATE INDEX IF NOT EXISTS idx_emails_status ON emails_enviados(status);
    `);

    console.log('📋 Adicionando colunas de auditoria em exames_anexos...');
    await db.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'exames_anexos' AND column_name = 'criado_em'
        ) THEN
          ALTER TABLE exames_anexos ADD COLUMN criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'exames_anexos' AND column_name = 'enviado_por'
        ) THEN
          ALTER TABLE exames_anexos ADD COLUMN enviado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL;
        END IF;
      END $$;
    `);

    console.log('📋 Verificando se existe usuário administrador...');
    const usuariosExistentes = await db.query('SELECT COUNT(*) as total FROM usuarios');
    const totalUsuarios = parseInt(usuariosExistentes.rows[0].total);

    if (totalUsuarios === 0) {
      console.log('👤 Criando usuário administrador padrão...');
      
      const perfilAdmin = await db.query("SELECT id FROM perfis WHERE nome = 'Admin' LIMIT 1");
      const perfilAdminId = perfilAdmin.rows[0]?.id;

      const emailAdmin = 'admin@astassessoria.com.br';
      const senhaAdmin = 'Admin@2024';
      const senhaHash = await bcrypt.hash(senhaAdmin, 10);

      await db.query(
        `INSERT INTO usuarios (nome, email, senha, perfil, perfil_id, ativo) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['Administrador', emailAdmin, senhaHash, 'admin', perfilAdminId, true]
      );

      console.log('✅ Usuário administrador criado:');
      console.log(`   📧 E-mail: ${emailAdmin}`);
      console.log(`   🔑 Senha: ${senhaAdmin}`);
      console.log('');
      console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
    } else {
      console.log(`✓ Tabela de usuários já possui ${totalUsuarios} usuário(s)`);
    }

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
