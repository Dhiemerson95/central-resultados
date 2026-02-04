const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:jFFqiEbuCJOqxXKzWJsWiQhNILdDQfas@yamabiko.proxy.rlwy.net:44128/railway',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function corrigirFonte() {
  try {
    console.log('🔧 Corrigindo fonte para Arial 8pt...');
    
    const result = await pool.query(
      `UPDATE configuracoes_sistema 
       SET fonte_familia = 'Arial', fonte_tamanho = 8 
       WHERE id = 1 
       RETURNING *`
    );
    
    if (result.rowCount > 0) {
      console.log('✅ Fonte corrigida com sucesso!');
      console.log('📝 Nova configuração:', result.rows[0]);
    } else {
      console.log('ℹ️ Nenhuma linha atualizada. Inserindo configuração padrão...');
      
      await pool.query(
        `INSERT INTO configuracoes_sistema (fonte_familia, fonte_tamanho) 
         VALUES ('Arial', 8) 
         ON CONFLICT (id) DO UPDATE 
         SET fonte_familia = 'Arial', fonte_tamanho = 8`
      );
      
      console.log('✅ Configuração padrão inserida!');
    }
    
  } catch (error) {
    console.error('❌ Erro ao corrigir fonte:', error.message);
  } finally {
    await pool.end();
    console.log('🔌 Conexão encerrada.');
  }
}

corrigirFonte();
