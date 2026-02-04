-- EXECUTE ESTE SCRIPT NO SEU POSTGRESQL LOCAL
-- Copie e cole no pgAdmin ou psql

\echo '🔧 Iniciando correção de colunas...\n'

-- 1. data_envio em exames
ALTER TABLE exames ADD COLUMN IF NOT EXISTS data_envio TIMESTAMP;

-- 2. caminho_arquivo em exames_anexos
ALTER TABLE exames_anexos ADD COLUMN IF NOT EXISTS caminho_arquivo VARCHAR(500);

-- 3. Cores extras em configuracoes_sistema
ALTER TABLE configuracoes_sistema ADD COLUMN IF NOT EXISTS cor_sucesso VARCHAR(7) DEFAULT '#27ae60';
ALTER TABLE configuracoes_sistema ADD COLUMN IF NOT EXISTS cor_alerta VARCHAR(7) DEFAULT '#f39c12';
ALTER TABLE configuracoes_sistema ADD COLUMN IF NOT EXISTS cor_perigo VARCHAR(7) DEFAULT '#e74c3c';

-- 4. Migrar dados de arquivo_path para caminho_arquivo (se existir)
UPDATE exames_anexos 
SET caminho_arquivo = arquivo_path 
WHERE caminho_arquivo IS NULL AND arquivo_path IS NOT NULL;

\echo '\n✅ Colunas corrigidas!\n'
\echo '📋 Verificando estrutura...\n'

-- Verificar
SELECT 'exames.data_envio' as coluna, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exames' AND column_name='data_envio') 
       THEN '✅ OK' ELSE '❌ FALTA' END as status
UNION ALL
SELECT 'exames_anexos.caminho_arquivo', 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exames_anexos' AND column_name='caminho_arquivo') 
       THEN '✅ OK' ELSE '❌ FALTA' END
UNION ALL
SELECT 'configuracoes_sistema.cor_sucesso', 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='configuracoes_sistema' AND column_name='cor_sucesso') 
       THEN '✅ OK' ELSE '❌ FALTA' END
UNION ALL
SELECT 'configuracoes_sistema.cor_alerta', 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='configuracoes_sistema' AND column_name='cor_alerta') 
       THEN '✅ OK' ELSE '❌ FALTA' END
UNION ALL
SELECT 'configuracoes_sistema.cor_perigo', 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='configuracoes_sistema' AND column_name='cor_perigo') 
       THEN '✅ OK' ELSE '❌ FALTA' END;

\echo '\n🚀 Pronto! Reinicie o servidor.\n'
