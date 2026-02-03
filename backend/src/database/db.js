const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  ssl: false,
  max: 5,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
});

pool.on('error', (err) => {
  console.error('❌ Erro inesperado no pool do PostgreSQL:', err.message);
  console.error('Stack completo:', err.stack);
});

pool.on('connect', () => {
  console.log('✅ Conectado ao banco de dados PostgreSQL');
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Erro ao tentar conectar no pool:', err.message);
    console.error('Código do erro:', err.code);
    console.error('Stack completo:', err.stack);
    console.error('Configuração usada:', {
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USER,
      ssl: false
    });
  } else {
    console.log('🔍 Pool conectado com sucesso - teste inicial OK');
    release();
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
