const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';
const useRailway = process.env.USE_RAILWAY === 'true';

let poolConfig;

if ((isProduction || useRailway) && process.env.DATABASE_URL) {
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
  console.log('🔗 Usando configuração LOCAL (localhost)');
  poolConfig = {
    host: process.env.DATABASE_HOST || 'localhost',
    port: process.env.DATABASE_PORT || 5432,
    database: process.env.DATABASE_NAME || 'central_resultados',
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    ssl: false,
    max: 10,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000
  };
  
  console.log('📋 Config local:', {
    host: poolConfig.host,
    port: poolConfig.port,
    database: poolConfig.database,
    user: poolConfig.user
  });
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('❌ Erro inesperado no pool do PostgreSQL:', err.message);
});

pool.on('connect', () => {
  console.log('✅ Conectado ao banco de dados PostgreSQL');
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Erro ao tentar conectar no pool:', err.message);
    console.error('Código do erro:', err.code);
    
    if (!isProduction && !useRailway) {
      console.error('💡 Dica: Certifique-se de que o PostgreSQL local está rodando na porta 5432');
      console.error('💡 Comando para iniciar: pg_ctl start (ou verifique o serviço no Windows)');
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
