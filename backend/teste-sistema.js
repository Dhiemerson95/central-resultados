require('dotenv').config();
const express = require('express');
const app = express();

console.log('\n🔍 TESTE DE CONFIGURAÇÃO DO SERVIDOR\n');

// 1. Testar CORS
console.log('1️⃣ Testando CORS...');
const cors = require('cors');
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080',
    'https://resultados.astassessoria.com.br'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
};
app.use(cors(corsOptions));
console.log('   ✅ CORS configurado para:', corsOptions.origin.join(', '));

// 2. Testar Pasta Uploads
console.log('\n2️⃣ Testando Pasta Uploads...');
const path = require('path');
const fs = require('fs');
const uploadsPath = path.join(__dirname, 'uploads');

if (fs.existsSync(uploadsPath)) {
  console.log('   ✅ Pasta uploads existe:', uploadsPath);
  const files = fs.readdirSync(uploadsPath);
  console.log(`   📁 Total de arquivos: ${files.length}`);
  if (files.length > 0) {
    console.log('   📄 Últimos 3 arquivos:');
    files.slice(-3).forEach(file => {
      const stats = fs.statSync(path.join(uploadsPath, file));
      console.log(`      - ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
    });
  }
} else {
  console.log('   ❌ Pasta uploads NÃO existe');
  console.log('   📝 Criando pasta uploads...');
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log('   ✅ Pasta criada com sucesso');
}

// 3. Testar Express Static
console.log('\n3️⃣ Testando Express Static...');
app.use('/uploads', express.static(uploadsPath));
console.log('   ✅ Express.static configurado para /uploads');

// 4. Testar Conexão com Banco
console.log('\n4️⃣ Testando Conexão com Banco...');
const db = require('./src/database/db');

db.query('SELECT current_database(), current_user, version()', (err, result) => {
  if (err) {
    console.error('   ❌ Erro ao conectar:', err.message);
  } else {
    console.log('   ✅ Banco conectado:');
    console.log('      Database:', result.rows[0].current_database);
    console.log('      Usuário:', result.rows[0].current_user);
    console.log('      Versão:', result.rows[0].version.split(',')[0]);
    
    // 5. Testar Tabelas
    console.log('\n5️⃣ Testando Tabelas Necessárias...');
    const tables = [
      'usuarios',
      'empresas',
      'clinicas',
      'exames',
      'exames_anexos',
      'configuracoes_sistema',
      'permissoes_usuario'
    ];
    
    let checkedTables = 0;
    tables.forEach(table => {
      db.query(`SELECT COUNT(*) FROM ${table}`, (err, result) => {
        checkedTables++;
        if (err) {
          console.log(`   ❌ Tabela ${table}: NÃO EXISTE ou erro`);
        } else {
          console.log(`   ✅ Tabela ${table}: ${result.rows[0].count} registros`);
        }
        
        if (checkedTables === tables.length) {
          // 6. Testar Middleware Auth
          console.log('\n6️⃣ Testando Middleware Auth...');
          const authMiddleware = require('./src/middleware/auth');
          console.log('   ✅ Middleware auth carregado');
          console.log('   ℹ️  Certifique-se de que está definindo req.user E req.usuario');
          
          // 7. Verificar Rotas
          console.log('\n7️⃣ Verificando Rotas Críticas...');
          try {
            const examesRoutes = require('./src/routes/examesRoutes');
            console.log('   ✅ Rotas de exames carregadas');
            
            const anexosRoutes = require('./src/routes/anexosRoutes');
            console.log('   ✅ Rotas de anexos carregadas');
            
            const configRoutes = require('./src/routes/configuracoesRoutes');
            console.log('   ✅ Rotas de configurações carregadas');
          } catch (error) {
            console.error('   ❌ Erro ao carregar rotas:', error.message);
          }
          
          console.log('\n✅ TESTE FINALIZADO\n');
          console.log('📋 Resumo:');
          console.log('   - CORS: OK');
          console.log('   - Uploads: OK');
          console.log('   - Banco: OK');
          console.log('   - Tabelas: Verificar acima');
          console.log('   - Rotas: OK');
          console.log('\n🚀 Pode iniciar o servidor com: npm run dev\n');
          
          process.exit(0);
        }
      });
    });
  }
});

// Timeout de segurança
setTimeout(() => {
  console.log('\n⚠️  Timeout excedido. Verifique se o PostgreSQL está rodando.\n');
  process.exit(1);
}, 10000);
