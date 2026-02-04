require('dotenv').config();
const db = require('./src/database/db');

console.log('\n🔍 VERIFICANDO ESTRUTURA DA TABELA exames_anexos\n');

db.query(`
  SELECT column_name, data_type, is_nullable, column_default
  FROM information_schema.columns 
  WHERE table_name = 'exames_anexos' 
  ORDER BY ordinal_position
`, (err, res) => {
  if (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
  
  if (res.rows.length === 0) {
    console.log('❌ Tabela exames_anexos NÃO EXISTE ou está vazia');
    process.exit(1);
  }
  
  console.log('✅ Tabela exames_anexos encontrada!\n');
  console.log('Colunas:');
  res.rows.forEach(col => {
    const nullable = col.is_nullable === 'YES' ? '(opcional)' : '(obrigatório)';
    console.log(`  - ${col.column_name} (${col.data_type}) ${nullable}`);
  });
  
  console.log('\n📋 Colunas relevantes para anexos:');
  const hasArquivoPath = res.rows.find(c => c.column_name === 'arquivo_path');
  const hasCaminhoArquivo = res.rows.find(c => c.column_name === 'caminho_arquivo');
  
  console.log(`  arquivo_path: ${hasArquivoPath ? '✅ EXISTE' : '❌ NÃO EXISTE'}`);
  console.log(`  caminho_arquivo: ${hasCaminhoArquivo ? '✅ EXISTE' : '❌ NÃO EXISTE'}`);
  
  if (hasArquivoPath && hasCaminhoArquivo) {
    console.log('\n⚠️  ATENÇÃO: Ambas as colunas existem!');
    console.log('   Recomendação: Usar caminho_arquivo (mais recente)');
  } else if (hasArquivoPath) {
    console.log('\n💡 Usar: arquivo_path');
  } else if (hasCaminhoArquivo) {
    console.log('\n💡 Usar: caminho_arquivo');
  }
  
  process.exit(0);
});

setTimeout(() => {
  console.error('\n⚠️  Timeout - PostgreSQL não respondeu\n');
  process.exit(1);
}, 5000);
