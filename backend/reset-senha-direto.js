require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

async function resetarSenha() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  console.log('\n🚨 RESETANDO SENHA DO ADMIN...\n');

  try {
    // Gerar hash da senha Admin@2024
    const senhaHash = await bcrypt.hash('Admin@2024', 10);
    console.log('Hash gerado:', senhaHash.substring(0, 30) + '...');

    // Atualizar no banco
    const result = await pool.query(
      'UPDATE usuarios SET senha = $1, ativo = true WHERE email = $2 RETURNING id, nome, email',
      [senhaHash, 'admin@astassessoria.com.br']
    );

    if (result.rows.length === 0) {
      console.log('❌ Usuário não encontrado');
    } else {
      console.log('\n✅ SENHA RESETADA COM SUCESSO!');
      console.log('   ID:', result.rows[0].id);
      console.log('   Nome:', result.rows[0].nome);
      console.log('   E-mail:', result.rows[0].email);
      console.log('\n🔑 CREDENCIAIS:');
      console.log('   E-mail: admin@astassessoria.com.br');
      console.log('   Senha: Admin@2024');
      console.log('\n🌐 ACESSE AGORA:');
      console.log('   https://resultados.astassessoria.com.br/login\n');
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    await pool.end();
    process.exit(1);
  }
}

resetarSenha();
