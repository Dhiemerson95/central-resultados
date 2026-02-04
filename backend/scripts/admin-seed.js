require('dotenv').config();
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

// IMPORTANTE: Configure seu .env antes de executar este script
// Este script usa as variáveis de ambiente do .env

const isProduction = process.env.NODE_ENV === 'production';
const useRailway = process.env.USE_RAILWAY === 'true';

let poolConfig;

if ((isProduction || useRailway) && process.env.DATABASE_URL) {
  console.log('🔗 Usando DATABASE_URL (Railway/Produção)');
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  };
} else {
  console.log('🔗 Usando banco LOCAL (localhost)');
  poolConfig = {
    host: process.env.DATABASE_HOST || 'localhost',
    port: process.env.DATABASE_PORT || 5432,
    database: process.env.DATABASE_NAME || 'central_resultados',
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    ssl: false
  };
  console.log('📋 Config:', {
    host: poolConfig.host,
    database: poolConfig.database
  });
}

const pool = new Pool(poolConfig);

async function createAdmin() {
  // Configure estas variáveis no .env:
  // ADMIN_EMAIL=seu@email.com
  // ADMIN_PASSWORD=SuaSenha123
  
  const email = process.env.ADMIN_EMAIL || "admin@exemplo.com";
  const senhaPura = process.env.ADMIN_PASSWORD || "admin123";
  const senhaCripto = await bcrypt.hash(senhaPura, 10);

  try {
    await pool.query(
      'INSERT INTO usuarios (nome, email, senha, perfil, ativo) VALUES ($1, $2, $3, $4, $5)',
      ['Administrador', email, senhaCripto, 'ADMIN', true]
    );
    console.log("---------------------------------------");
    console.log("✅ USUÁRIO CRIADO COM SUCESSO!");
    console.log(`📧 Email: ${email}`);
    console.log("---------------------------------------");
  } catch (err) {
    console.error("❌ ERRO AO CRIAR:", err.message);
  } finally {
    pool.end();
  }
}

createAdmin();
