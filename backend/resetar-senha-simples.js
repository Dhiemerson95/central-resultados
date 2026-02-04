require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

async function resetarComSenhaSimples() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  console.log('\n🔧 RESETANDO COM SENHA SIMPLES...\n');

  try {
    // Senha: 123456 (simples para testar)
    const senhaTeste = '123456';
    const hashTeste = await bcrypt.hash(senhaTeste, 10);
    
    console.log('Hash gerado:', hashTeste);
    
    // Validar o hash ANTES de salvar
    const valido = await bcrypt.compare(senhaTeste, hashTeste);
    console.log('Hash validado:', valido ? '✅ OK' : '❌ FALHOU');

    if (!valido) {
      console.log('❌ Hash inválido! Abortando...');
      await pool.end();
      process.exit(1);
    }

    // Salvar no banco
    const result = await pool.query(
      'UPDATE usuarios SET senha = $1, ativo = true WHERE email = $2 RETURNING id, nome, email',
      [hashTeste, 'admin@astassessoria.com.br']
    );

    if (result.rows.length > 0) {
      console.log('\n✅ SENHA RESETADA COM SUCESSO!');
      console.log('   ID:', result.rows[0].id);
      console.log('   Nome:', result.rows[0].nome);
      console.log('   E-mail:', result.rows[0].email);
      console.log('\n🔑 CREDENCIAIS PARA TESTE:');
      console.log('   E-mail: admin@astassessoria.com.br');
      console.log('   Senha: 123456');
      console.log('\n🌐 ACESSE: http://localhost:3000');
      console.log('\n⚠️  IMPORTANTE: Altere a senha depois de entrar!\n');
    } else {
      console.log('❌ Usuário não encontrado');
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    console.error(error.stack);
    await pool.end();
    process.exit(1);
  }
}

resetarComSenhaSimples();
