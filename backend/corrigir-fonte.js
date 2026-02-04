require('dotenv').config();
const { Pool } = require('pg');

async function corrigirFonte() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  console.log('\n🔤 CORRIGINDO FONTE PADRÃO...\n');

  try {
    await pool.query(`
      UPDATE configuracoes_sistema 
      SET fonte_familia = 'Arial', 
          fonte_tamanho = 8
    `);

    console.log('✅ Fonte padrão corrigida:');
    console.log('   Fonte: Arial');
    console.log('   Tamanho: 8pt\n');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    await pool.end();
    process.exit(1);
  }
}

corrigirFonte();
