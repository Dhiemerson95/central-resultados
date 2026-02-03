const bcrypt = require('bcrypt');
const { Pool } = require('pg');

// 1. VÁ NO RAILWAY > POSTGRES > VARIABLES > COPIE A 'DATABASE_URL'
// 2. COLE O LINK NO LUGAR DO TEXTO ABAIXO (MANTENHA AS ASPAS)
const connectionString = "postgresql://postgres:jFFqiEbuCJOqxXKzWJsWiQhNILdDQfas@yamabiko.proxy.rlwy.net:44128/railway";

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

async function createAdmin() {
  const email = "astassessoria@astassessoria.com.br"; // <-- COLOQUE O EMAIL QUE VOCÊ QUER USAR
  const senhaPura = "Dhi36363562a*";           // <-- COLOQUE A SENHA QUE VOCÊ QUER USAR
  const senhaCripto = await bcrypt.hash(senhaPura, 10);

  try {
    // Esse comando insere você direto no banco da nuvem
    await pool.query(
      'INSERT INTO usuarios (nome, email, senha, perfil, ativo) VALUES ($1, $2, $3, $4, $5)',
      ['Administrador', email, senhaCripto, 'ADMIN', true]
    );
    console.log("---------------------------------------");
    console.log("✅ USUÁRIO CRIADO COM SUCESSO NO RAILWAY!");
    console.log("---------------------------------------");
  } catch (err) {
    console.error("❌ ERRO AO CRIAR:", err.message);
  } finally {
    pool.end();
  }
}

createAdmin();
