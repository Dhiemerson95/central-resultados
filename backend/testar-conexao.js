require('dotenv').config();

console.log('\n🔍 DIAGNÓSTICO DE CONEXÃO\n');

console.log('📋 Variáveis de Ambiente:');
console.log('  NODE_ENV:', process.env.NODE_ENV || '(não definida - padrão: development)');
console.log('  USE_RAILWAY:', process.env.USE_RAILWAY || '(não definida)');
console.log('  DATABASE_URL:', process.env.DATABASE_URL ? 'DEFINIDA (Railway)' : '(não definida)');
console.log('  DATABASE_HOST:', process.env.DATABASE_HOST || 'localhost (padrão)');
console.log('  DATABASE_PORT:', process.env.DATABASE_PORT || '5432 (padrão)');
console.log('  DATABASE_NAME:', process.env.DATABASE_NAME || 'central_resultados (padrão)');
console.log('  DATABASE_USER:', process.env.DATABASE_USER || 'postgres (padrão)');
console.log('  DATABASE_PASSWORD:', process.env.DATABASE_PASSWORD ? '****** (DEFINIDA)' : '(não definida)');

console.log('\n🎯 Modo de Conexão:');
const isProduction = process.env.NODE_ENV === 'production';
const useRailway = process.env.USE_RAILWAY === 'true';

if ((isProduction || useRailway) && process.env.DATABASE_URL) {
  console.log('  ☁️ RAILWAY/PRODUÇÃO (DATABASE_URL)');
} else {
  console.log('  🏠 LOCAL (localhost)');
}

console.log('\n🔧 Testando Conexão...\n');

const { Pool } = require('pg');

let poolConfig;

if ((isProduction || useRailway) && process.env.DATABASE_URL) {
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  };
} else {
  poolConfig = {
    host: process.env.DATABASE_HOST || 'localhost',
    port: process.env.DATABASE_PORT || 5432,
    database: process.env.DATABASE_NAME || 'central_resultados',
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    ssl: false
  };
}

const pool = new Pool(poolConfig);

pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ ERRO AO CONECTAR:');
    console.error('   Código:', err.code);
    console.error('   Mensagem:', err.message);
    
    if (err.code === 'ENOTFOUND') {
      console.error('\n💡 Solução: Host não encontrado');
      console.error('   - Verifique se DATABASE_URL está correta');
      console.error('   - Se está em desenvolvimento, remova DATABASE_URL do .env');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('\n💡 Solução: Conexão recusada');
      console.error('   - Verifique se PostgreSQL está rodando');
      console.error('   - Comando: Get-Service | Where-Object {$_.Name -like "*postgres*"}');
    } else if (err.code === '28P01') {
      console.error('\n💡 Solução: Senha incorreta');
      console.error('   - Verifique DATABASE_PASSWORD no .env');
    } else if (err.code === '3D000') {
      console.error('\n💡 Solução: Banco de dados não existe');
      console.error('   - Crie o banco: CREATE DATABASE central_resultados;');
    }
    
    process.exit(1);
  } else {
    console.log('✅ CONEXÃO BEM-SUCEDIDA!');
    
    client.query('SELECT version(), current_database(), current_user', (err, result) => {
      if (err) {
        console.error('❌ Erro ao consultar banco:', err.message);
      } else {
        console.log('\n📊 Informações do Banco:');
        console.log('   Versão PostgreSQL:', result.rows[0].version.split(',')[0]);
        console.log('   Database:', result.rows[0].current_database);
        console.log('   Usuário:', result.rows[0].current_user);
      }
      
      release();
      pool.end();
      console.log('\n✅ Teste finalizado com sucesso!\n');
    });
  }
});
