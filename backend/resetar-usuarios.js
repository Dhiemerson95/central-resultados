require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const usuarios = [
  'dep.tecnico@astassessoria.com.br',
  'mcosmo66@gmail.com',
  'cliente@astassessoria.com.br'
];

async function resetarSenhas() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  console.log('\n🔑 RESETANDO SENHAS...\n');

  try {
    const senhaPadrao = '123456';
    const hashSenha = await bcrypt.hash(senhaPadrao, 10);

    for (const email of usuarios) {
      const result = await pool.query(
        'UPDATE usuarios SET senha = $1, ativo = true WHERE email = $2 RETURNING id, nome, email',
        [hashSenha, email]
      );

      if (result.rows.length > 0) {
        console.log(`✅ ${result.rows[0].nome} (${email})`);
      } else {
        console.log(`❌ Usuário não encontrado: ${email}`);
      }
    }

    console.log('\n🔑 Senha resetada para: 123456');
    console.log('⚠️  Peça para os usuários alterarem após o primeiro login!\n');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    await pool.end();
    process.exit(1);
  }
}

resetarSenhas();
