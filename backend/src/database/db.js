const { Pool } = require('pg');
require('dotenv').config();

let poolConfig;

if (process.env.DATABASE_URL) {
  console.log('🔗 Usando DATABASE_URL para conexão (Railway/Produção)');
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    max: 10,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000
  };
} else {
  console.log('🔗 Usando variáveis separadas para conexão (Local)');
  poolConfig = {
    host: process.env.DATABASE_HOST || 'localhost',
    port: process.env.DATABASE_PORT || 5432,
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    ssl: process.env.DATABASE_SSL === 'true' ? {
      rejectUnauthorized: false
    } : false,
    max: 10,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000
  };
}

const pool = new Pool(poolConfig);

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
    
    if (process.env.DATABASE_URL) {
      console.error('DATABASE_URL está definida:', process.env.DATABASE_URL ? 'SIM' : 'NÃO');
    } else {
      console.error('Configuração usada:', {
        host: process.env.DATABASE_HOST || 'localhost',
        port: process.env.DATABASE_PORT || 5432,
        database: process.env.DATABASE_NAME,
        user: process.env.DATABASE_USER,
        ssl: process.env.DATABASE_SSL === 'true'
      });
    }
  } else {
    console.log('🔍 Pool conectado com sucesso - teste inicial OK');
    release();
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
