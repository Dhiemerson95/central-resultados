const db = require('./db');

const adicionarCamposClinicas = async () => {
  try {
    await db.query(`
      ALTER TABLE clinicas 
      ADD COLUMN IF NOT EXISTS email_contato VARCHAR(255),
      ADD COLUMN IF NOT EXISTS telefone VARCHAR(20),
      ADD COLUMN IF NOT EXISTS observacao TEXT;
    `);

    await db.query(`
      ALTER TABLE clinicas 
      DROP CONSTRAINT IF EXISTS tipo_integracao_check;
    `);

    await db.query(`
      ALTER TABLE clinicas 
      ADD CONSTRAINT tipo_integracao_check 
      CHECK (tipo_integracao IN ('api', 'importacao', 'manual', 'planilha'));
    `);

    console.log('Campos adicionados à tabela clinicas com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao adicionar campos:', error);
    process.exit(1);
  }
};

adicionarCamposClinicas();
