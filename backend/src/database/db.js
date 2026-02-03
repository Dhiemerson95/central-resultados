const { Pool } = require('pg');
require('dotenv').config();

// O Railway exige SSL para conexões externas. 
// Esse código verifica se existe uma DATABASE_URL (nuvem) para ativar o SSL.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('Erro inesperado no pool do PostgreSQL', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
