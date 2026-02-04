require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

async function resetarSenhaProducao() {
  // Conectar NO RAILWAY usando a variável do .env
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  console.log('\n🚨 RESETANDO SENHA NO RAILWAY (PRODUÇÃO)...\n');

  try {
    // Senha: 123456
    const senhaTeste = '123456';
    const hashTeste = await bcrypt.hash(senhaTeste, 10);
    
    console.log('Hash gerado:', hashTeste.substring(0, 30) + '...');
    
    // Validar o hash
    const valido = await bcrypt.compare(senhaTeste, hashTeste);
    console.log('Hash validado:', valido ? '✅ OK' : '❌ FALHOU');

    if (!valido) {
      console.log('❌ Hash inválido! Abortando...');
      await pool.end();
      process.exit(1);
    }

    // Salvar no banco do RAILWAY
    const result = await pool.query(
      'UPDATE usuarios SET senha = $1, ativo = true WHERE email = $2 RETURNING id, nome, email',
      [hashTeste, 'admin@astassessoria.com.br']
    );

    if (result.rows.length > 0) {
      console.log('\n✅ SENHA RESETADA NO RAILWAY!');
      console.log('   ID:', result.rows[0].id);
      console.log('   Nome:', result.rows[0].nome);
      console.log('   E-mail:', result.rows[0].email);
      console.log('\n🔑 CREDENCIAIS:');
      console.log('   E-mail: admin@astassessoria.com.br');
      console.log('   Senha: 123456');
      console.log('\n🌐 ACESSE: https://resultados.astassessoria.com.br/login');
      console.log('\n✅ SISTEMA AGORA RODA 24/7 NA NUVEM!');
      console.log('⚠️  Altere a senha depois de entrar!\n');
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

resetarSenhaProducao();
