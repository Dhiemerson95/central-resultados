require('dotenv').config();
const db = require('./src/database/db');

console.log('\n🔧 CORRIGINDO ESTRUTURA DO BANCO DE DADOS\n');

const correcoes = [
  {
    nome: 'Coluna data_envio em exames',
    sql: `
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'exames' AND column_name = 'data_envio'
        ) THEN
          ALTER TABLE exames ADD COLUMN data_envio TIMESTAMP;
        END IF;
      END $$;
    `
  },
  {
    nome: 'Coluna caminho_arquivo em exames_anexos',
    sql: `
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'exames_anexos' AND column_name = 'caminho_arquivo'
        ) THEN
          ALTER TABLE exames_anexos ADD COLUMN caminho_arquivo VARCHAR(500);
        END IF;
      END $$;
    `
  },
  {
    nome: 'Migrar dados de arquivo_path para caminho_arquivo',
    sql: `
      UPDATE exames_anexos 
      SET caminho_arquivo = arquivo_path 
      WHERE caminho_arquivo IS NULL AND arquivo_path IS NOT NULL;
    `
  },
  {
    nome: 'Coluna cor_sucesso em configuracoes_sistema',
    sql: `
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'configuracoes_sistema' AND column_name = 'cor_sucesso'
        ) THEN
          ALTER TABLE configuracoes_sistema ADD COLUMN cor_sucesso VARCHAR(7) DEFAULT '#27ae60';
        END IF;
      END $$;
    `
  },
  {
    nome: 'Coluna cor_alerta em configuracoes_sistema',
    sql: `
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'configuracoes_sistema' AND column_name = 'cor_alerta'
        ) THEN
          ALTER TABLE configuracoes_sistema ADD COLUMN cor_alerta VARCHAR(7) DEFAULT '#f39c12';
        END IF;
      END $$;
    `
  },
  {
    nome: 'Coluna cor_perigo em configuracoes_sistema',
    sql: `
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'configuracoes_sistema' AND column_name = 'cor_perigo'
        ) THEN
          ALTER TABLE configuracoes_sistema ADD COLUMN cor_perigo VARCHAR(7) DEFAULT '#e74c3c';
        END IF;
      END $$;
    `
  }
];

async function executarCorrecoes() {
  let sucesso = 0;
  let falhas = 0;

  for (const correcao of correcoes) {
    try {
      console.log(`📝 ${correcao.nome}...`);
      await db.query(correcao.sql);
      console.log(`   ✅ OK\n`);
      sucesso++;
    } catch (error) {
      console.error(`   ❌ ERRO: ${error.message}\n`);
      falhas++;
    }
  }

  console.log('\n📊 RESUMO:');
  console.log(`   ✅ Sucesso: ${sucesso}`);
  console.log(`   ❌ Falhas: ${falhas}`);

  // Verificar estrutura final
  console.log('\n🔍 VERIFICANDO ESTRUTURA FINAL...\n');

  const verificacoes = [
    { tabela: 'exames', coluna: 'data_envio' },
    { tabela: 'exames', coluna: 'enviado_cliente' },
    { tabela: 'exames', coluna: 'lancado_soc' },
    { tabela: 'exames_anexos', coluna: 'caminho_arquivo' },
    { tabela: 'exames_anexos', coluna: 'nome_arquivo' },
    { tabela: 'exames_anexos', coluna: 'oficial' },
    { tabela: 'configuracoes_sistema', coluna: 'cor_primaria' },
    { tabela: 'configuracoes_sistema', coluna: 'cor_secundaria' },
    { tabela: 'configuracoes_sistema', coluna: 'cor_sucesso' },
    { tabela: 'configuracoes_sistema', coluna: 'cor_alerta' },
    { tabela: 'configuracoes_sistema', coluna: 'cor_perigo' }
  ];

  for (const { tabela, coluna } of verificacoes) {
    try {
      const result = await db.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = $1 AND column_name = $2
      `, [tabela, coluna]);

      if (result.rows.length > 0) {
        const col = result.rows[0];
        console.log(`✅ ${tabela}.${coluna} (${col.data_type})`);
      } else {
        console.log(`❌ ${tabela}.${coluna} NÃO EXISTE`);
      }
    } catch (error) {
      console.error(`❌ Erro ao verificar ${tabela}.${coluna}: ${error.message}`);
    }
  }

  console.log('\n✅ CORREÇÕES FINALIZADAS!\n');
  console.log('🚀 Reinicie o servidor com: npm run dev\n');
  
  process.exit(0);
}

// Executar
executarCorrecoes().catch(error => {
  console.error('\n❌ ERRO FATAL:', error.message);
  console.error('\nVerifique se:');
  console.error('  1. PostgreSQL está rodando');
  console.error('  2. Credenciais no .env estão corretas');
  console.error('  3. Banco de dados "central_resultados" existe\n');
  process.exit(1);
});
