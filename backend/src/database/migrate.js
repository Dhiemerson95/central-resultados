const db = require('./db');

const createTables = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        perfil VARCHAR(50) DEFAULT 'usuario',
        ativo BOOLEAN DEFAULT true,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS empresas (
        id SERIAL PRIMARY KEY,
        razao_social VARCHAR(255) NOT NULL,
        cnpj VARCHAR(18),
        email_padrao VARCHAR(255),
        codigo_soc VARCHAR(100),
        telefone VARCHAR(20),
        observacao TEXT,
        ativo BOOLEAN DEFAULT true,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS clinicas (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        cnpj VARCHAR(18),
        tipo_integracao VARCHAR(50) NOT NULL,
        config_api JSONB,
        config_importacao JSONB,
        intervalo_busca INTEGER DEFAULT 60,
        ativo BOOLEAN DEFAULT true,
        ultima_sincronizacao TIMESTAMP,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT tipo_integracao_check CHECK (tipo_integracao IN ('api', 'importacao', 'manual'))
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS exames (
        id SERIAL PRIMARY KEY,
        empresa_id INTEGER REFERENCES empresas(id),
        clinica_id INTEGER REFERENCES clinicas(id),
        funcionario_nome VARCHAR(255) NOT NULL,
        funcionario_cpf VARCHAR(14),
        funcionario_matricula VARCHAR(100),
        data_atendimento DATE NOT NULL,
        tipo_exame VARCHAR(100) NOT NULL,
        resultado VARCHAR(100),
        status VARCHAR(100) DEFAULT 'pendente',
        enviado_cliente BOOLEAN DEFAULT false,
        data_envio_cliente TIMESTAMP,
        lancado_soc BOOLEAN DEFAULT false,
        data_lancamento_soc TIMESTAMP,
        observacao TEXT,
        codigo_exame_soc VARCHAR(100),
        arquivo_laudo VARCHAR(500),
        dados_adicionais JSONB,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_exames_empresa ON exames(empresa_id);
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_exames_clinica ON exames(clinica_id);
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_exames_data ON exames(data_atendimento);
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_exames_status ON exames(status);
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_exames_enviado ON exames(enviado_cliente);
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_exames_lancado_soc ON exames(lancado_soc);
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS logs_integracao (
        id SERIAL PRIMARY KEY,
        clinica_id INTEGER REFERENCES clinicas(id),
        tipo VARCHAR(50),
        status VARCHAR(50),
        mensagem TEXT,
        dados JSONB,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS historico_emails (
        id SERIAL PRIMARY KEY,
        exame_id INTEGER REFERENCES exames(id),
        destinatario VARCHAR(255) NOT NULL,
        assunto VARCHAR(500),
        corpo TEXT,
        enviado BOOLEAN DEFAULT false,
        erro TEXT,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Tabelas criadas com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao criar tabelas:', error);
    process.exit(1);
  }
};

createTables();
