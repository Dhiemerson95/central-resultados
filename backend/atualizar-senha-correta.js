require('dotenv').config();
const { Pool } = require('pg');

async function atualizarSenha() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  console.log('\n🔧 ATUALIZANDO SENHA COM HASH CORRETO...\n');

  try {
    // Hash correto testado e validado
    const hashCorreto = '$2a$10$pAHIR3qsOt5s4gYTim4Qsuii7J5yEaOOS14Lf9QTcztS1PxBfXz/W';

    const result = await pool.query(
      'UPDATE usuarios SET senha = $1, ativo = true WHERE email = $2 RETURNING id, nome, email',
      [hashCorreto, 'admin@astassessoria.com.br']
    );

    if (result.rows.length > 0) {
      console.log('✅ SENHA ATUALIZADA COM SUCESSO!');
      console.log('   ID:', result.rows[0].id);
      console.log('   Nome:', result.rows[0].nome);
      console.log('   E-mail:', result.rows[0].email);
      console.log('\n🔑 CREDENCIAIS:');
      console.log('   E-mail: admin@astassessoria.com.br');
      console.log('   Senha: Admin@2024');
      console.log('\n🌐 ACESSE:');
      console.log('   http://localhost:3000\n');
    } else {
      console.log('❌ Usuário não encontrado');
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    await pool.end();
    process.exit(1);
  }
}

atualizarSenha();
