require('dotenv').config();
const db = require('./src/database/db');
const fs = require('fs');
const path = require('path');

console.log('\n🔍 DIAGNÓSTICO DE ANEXOS\n');

async function diagnostico() {
  try {
    // 1. Verificar pasta uploads
    console.log('1️⃣ Verificando pasta uploads...');
    const uploadsPath = path.join(__dirname, 'uploads');
    
    if (!fs.existsSync(uploadsPath)) {
      console.error('   ❌ Pasta uploads não existe!');
      console.log('   📝 Criando pasta...');
      fs.mkdirSync(uploadsPath, { recursive: true });
      console.log('   ✅ Pasta criada');
    } else {
      console.log('   ✅ Pasta uploads existe:', uploadsPath);
      const files = fs.readdirSync(uploadsPath);
      console.log(`   📁 Total de arquivos: ${files.length}`);
      
      if (files.length > 0) {
        console.log('   📄 Últimos 5 arquivos:');
        files.slice(-5).forEach(file => {
          const stats = fs.statSync(path.join(uploadsPath, file));
          const sizeKB = (stats.size / 1024).toFixed(2);
          console.log(`      - ${file} (${sizeKB} KB)`);
        });
      }
    }

    // 2. Verificar estrutura da tabela
    console.log('\n2️⃣ Verificando estrutura da tabela exames_anexos...');
    const colunas = await db.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'exames_anexos' 
      ORDER BY ordinal_position
    `);
    
    if (colunas.rows.length === 0) {
      console.error('   ❌ Tabela exames_anexos não existe!');
    } else {
      console.log('   ✅ Tabela existe com', colunas.rows.length, 'colunas:');
      colunas.rows.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? '(opcional)' : '(obrigatório)';
        console.log(`      - ${col.column_name} (${col.data_type}) ${nullable}`);
      });
    }

    // 3. Verificar registros
    console.log('\n3️⃣ Verificando registros de anexos...');
    const anexos = await db.query(`
      SELECT 
        id,
        exame_id,
        nome_arquivo,
        caminho_arquivo,
        oficial,
        criado_em
      FROM exames_anexos
      ORDER BY criado_em DESC
      LIMIT 10
    `);

    if (anexos.rows.length === 0) {
      console.log('   ⚠️  Nenhum anexo cadastrado ainda');
    } else {
      console.log(`   ✅ Total de anexos: ${anexos.rows.length}`);
      console.log('   📋 Últimos anexos:');
      anexos.rows.forEach(anexo => {
        const oficial = anexo.oficial ? '✓ OFICIAL' : '  rascunho';
        console.log(`      ${oficial} | ID: ${anexo.id} | Exame: ${anexo.exame_id}`);
        console.log(`         Nome: ${anexo.nome_arquivo}`);
        console.log(`         Caminho: ${anexo.caminho_arquivo}`);
        
        // Verificar se arquivo existe fisicamente
        const filePath = path.join(uploadsPath, anexo.caminho_arquivo);
        const exists = fs.existsSync(filePath);
        if (exists) {
          const stats = fs.statSync(filePath);
          console.log(`         Arquivo: ✅ Existe (${(stats.size / 1024).toFixed(2)} KB)`);
        } else {
          console.log(`         Arquivo: ❌ NÃO EXISTE no disco!`);
        }
        console.log('');
      });
    }

    // 4. Verificar configuração do multer
    console.log('4️⃣ Verificando configuração do multer...');
    try {
      const uploadMiddleware = require('./src/middleware/upload');
      console.log('   ✅ Middleware de upload carregado');
    } catch (error) {
      console.error('   ❌ Erro ao carregar middleware:', error.message);
    }

    // 5. Testar URL de acesso
    console.log('\n5️⃣ URLs de teste:');
    console.log('   📡 Backend deve estar em: http://localhost:8080');
    console.log('   📁 Arquivos estáticos: http://localhost:8080/uploads/');
    
    if (anexos.rows.length > 0) {
      const primeiroAnexo = anexos.rows[0];
      console.log(`   🧪 Teste com primeiro anexo:`);
      console.log(`      http://localhost:8080/uploads/${primeiroAnexo.caminho_arquivo}`);
      console.log('      (Abra esta URL no navegador para testar)');
    }

    console.log('\n✅ DIAGNÓSTICO CONCLUÍDO\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

diagnostico();
