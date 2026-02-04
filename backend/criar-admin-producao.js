require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

console.log('\n🔧 CRIANDO USUÁRIO ADMIN NO RAILWAY\n');

// Conecta DIRETO no Railway (não no localhost)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function criarAdmin() {
  try {
    console.log('📡 Conectando no banco do Railway...');
    
    // 1. Verificar se o usuário já existe
    console.log('\n1️⃣ Verificando se o admin já existe...');
    const usuarioExiste = await pool.query(
      "SELECT id, email FROM usuarios WHERE email = $1",
      ['admin@astassessoria.com.br']
    );

    if (usuarioExiste.rows.length > 0) {
      console.log('✅ Usuário admin JÁ EXISTE no banco do Railway!');
      console.log('   ID:', usuarioExiste.rows[0].id);
      console.log('   E-mail:', usuarioExiste.rows[0].email);
      console.log('\n📧 E-mail: admin@astassessoria.com.br');
      console.log('🔑 Senha: Admin@2024');
      console.log('\n⚠️  Se não conseguir logar, a senha pode ter sido alterada.');
      console.log('   Execute este script novamente para RESETAR a senha.\n');
      
      // Perguntar se quer resetar a senha
      console.log('🔄 RESETANDO senha para Admin@2024...');
      const senhaHash = await bcrypt.hash('Admin@2024', 10);
      await pool.query(
        "UPDATE usuarios SET senha = $1 WHERE email = $2",
        [senhaHash, 'admin@astassessoria.com.br']
      );
      console.log('✅ Senha resetada com sucesso!\n');
      
      await pool.end();
      process.exit(0);
    }

    // 2. Buscar perfil Admin
    console.log('\n2️⃣ Buscando perfil Admin...');
    const perfilAdmin = await pool.query(
      "SELECT id FROM perfis WHERE nome = 'Admin' LIMIT 1"
    );

    if (perfilAdmin.rows.length === 0) {
      console.error('❌ ERRO: Perfil Admin não existe no banco!');
      console.log('   Execute primeiro as migrations: npm run dev\n');
      await pool.end();
      process.exit(1);
    }

    const perfilAdminId = perfilAdmin.rows[0].id;
    console.log('✅ Perfil Admin encontrado (ID:', perfilAdminId + ')');

    // 3. Criar usuário
    console.log('\n3️⃣ Criando usuário administrador...');
    
    const emailAdmin = 'admin@astassessoria.com.br';
    const senhaAdmin = 'Admin@2024';
    const senhaHash = await bcrypt.hash(senhaAdmin, 10);

    const resultado = await pool.query(
      `INSERT INTO usuarios (nome, email, senha, perfil, perfil_id, ativo) 
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, nome, email`,
      ['Administrador', emailAdmin, senhaHash, 'admin', perfilAdminId, true]
    );

    console.log('✅ USUÁRIO CRIADO COM SUCESSO!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   ID:', resultado.rows[0].id);
    console.log('   Nome:', resultado.rows[0].nome);
    console.log('   E-mail:', resultado.rows[0].email);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🌐 CREDENCIAIS PARA LOGIN:');
    console.log('   📧 E-mail: admin@astassessoria.com.br');
    console.log('   🔑 Senha: Admin@2024');
    console.log('\n⚠️  IMPORTANTE: Altere a senha após o primeiro login!\n');

    await pool.end();
    console.log('✅ Concluído! Tente fazer login agora.\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERRO AO CRIAR ADMIN:', error.message);
    console.error('\nDetalhes:', error);
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n⚠️  Erro de conexão! Verifique se DATABASE_URL está correta no .env');
    }
    
    if (error.code === '23505') {
      console.log('\n⚠️  Usuário já existe! Use o e-mail e senha padrão para logar.');
    }

    await pool.end();
    process.exit(1);
  }
}

criarAdmin();
