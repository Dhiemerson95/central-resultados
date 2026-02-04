-- Script de correção de colunas faltantes
-- Execute este script no seu PostgreSQL local

-- 1. Adicionar coluna data_envio na tabela exames (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exames' AND column_name = 'data_envio'
    ) THEN
        ALTER TABLE exames ADD COLUMN data_envio TIMESTAMP;
        RAISE NOTICE '✅ Coluna data_envio adicionada em exames';
    ELSE
        RAISE NOTICE 'ℹ️  Coluna data_envio já existe em exames';
    END IF;
END $$;

-- 2. Adicionar coluna caminho_arquivo na tabela exames_anexos (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exames_anexos' AND column_name = 'caminho_arquivo'
    ) THEN
        ALTER TABLE exames_anexos ADD COLUMN caminho_arquivo VARCHAR(500);
        RAISE NOTICE '✅ Coluna caminho_arquivo adicionada em exames_anexos';
    ELSE
        RAISE NOTICE 'ℹ️  Coluna caminho_arquivo já existe em exames_anexos';
    END IF;
END $$;

-- 3. Se a coluna antiga arquivo_path existir, migrar dados para caminho_arquivo
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exames_anexos' AND column_name = 'arquivo_path'
    ) THEN
        -- Copiar dados de arquivo_path para caminho_arquivo
        UPDATE exames_anexos 
        SET caminho_arquivo = arquivo_path 
        WHERE caminho_arquivo IS NULL AND arquivo_path IS NOT NULL;
        
        RAISE NOTICE '✅ Dados migrados de arquivo_path para caminho_arquivo';
    END IF;
END $$;

-- 4. Adicionar colunas de cores extras em configuracoes_sistema (se não existirem)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'configuracoes_sistema' AND column_name = 'cor_sucesso'
    ) THEN
        ALTER TABLE configuracoes_sistema ADD COLUMN cor_sucesso VARCHAR(7) DEFAULT '#27ae60';
        RAISE NOTICE '✅ Coluna cor_sucesso adicionada';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'configuracoes_sistema' AND column_name = 'cor_alerta'
    ) THEN
        ALTER TABLE configuracoes_sistema ADD COLUMN cor_alerta VARCHAR(7) DEFAULT '#f39c12';
        RAISE NOTICE '✅ Coluna cor_alerta adicionada';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'configuracoes_sistema' AND column_name = 'cor_perigo'
    ) THEN
        ALTER TABLE configuracoes_sistema ADD COLUMN cor_perigo VARCHAR(7) DEFAULT '#e74c3c';
        RAISE NOTICE '✅ Coluna cor_perigo adicionada';
    END IF;
END $$;

-- 5. Verificar estrutura final
SELECT 
    'exames' as tabela,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'exames' AND column_name IN ('data_envio', 'enviado_cliente', 'lancado_soc')
UNION ALL
SELECT 
    'exames_anexos' as tabela,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'exames_anexos' AND column_name IN ('caminho_arquivo', 'nome_arquivo', 'oficial')
ORDER BY tabela, column_name;

-- Fim do script
