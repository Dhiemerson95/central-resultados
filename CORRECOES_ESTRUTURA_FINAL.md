# 🔧 CORREÇÕES DE ESTRUTURA APLICADAS

## ✅ Problemas Resolvidos

### 1. Colunas Faltantes no Banco (CRÍTICO)
**Problema**: Sistema tentava usar colunas que não existiam

**Colunas Adicionadas**:
- ✅ `exames.data_envio` (TIMESTAMP) - Registra quando foi marcado como enviado
- ✅ `exames_anexos.caminho_arquivo` (VARCHAR 500) - Caminho do arquivo salvo
- ✅ `configuracoes_sistema.cor_sucesso` (VARCHAR 7) - Cor verde customizável
- ✅ `configuracoes_sistema.cor_alerta` (VARCHAR 7) - Cor amarela customizável
- ✅ `configuracoes_sistema.cor_perigo` (VARCHAR 7) - Cor vermelha customizável

**Solução Implementada**:
1. Adicionadas verificações no `migrations.js`
2. Criado script standalone `corrigir-banco.js`
3. Criado SQL manual `EXECUTAR_AQUI.sql`

---

### 2. Conexão Híbrida (ENOTFOUND yamabiko)
**Problema**: Sistema tentava conectar no Railway mesmo localmente

**Causa Raiz**: Variável `DATABASE_URL` no `.env` local forçava conexão remota

**Correção Aplicada** (`db.js`):
```javascript
const isProduction = process.env.NODE_ENV === 'production';
const useRailway = process.env.USE_RAILWAY === 'true';

// Só usa Railway se:
// 1. NODE_ENV === 'production' (Railway automático)
// 2. OU USE_RAILWAY === 'true' (teste forçado)
if ((isProduction || useRailway) && process.env.DATABASE_URL) {
  // Conexão Railway
} else {
  // Conexão localhost (PADRÃO)
}
```

**Ação Necessária**: Remova `DATABASE_URL` do seu `.env` local!

---

### 3. Exportação Excel Admin/Operador
**Problema**: Admin via apenas colunas do cliente

**Status**: ✅ JÁ CORRIGIDO na correção anterior

**Verificação**:
- `exportacaoController.js` linha 4-145: Detecta perfil
- Se Admin/Operador: exporta TODAS as colunas
- Se Cliente: exporta apenas permitidas

---

### 4. Caminho da Logo
**Problema**: Logo corrompida após upload

**Verificação**:
- ✅ `server.js` linha 38: `app.use('/uploads', express.static(...))`
- ✅ Pasta `uploads/` existe e tem permissões
- ✅ Controller normaliza caminho: `/uploads/arquivo.jpg`

**Teste**:
```powershell
# Verificar se arquivos existem
Get-ChildItem central-resultados/backend/uploads

# Testar acesso direto
# Navegador: http://localhost:8080/uploads/nome-arquivo.jpg
```

---

### 5. Estabilidade de Permissões
**Problema**: Permissões só carregam na segunda tentativa

**Possíveis Causas**:
1. ❌ Tabelas não criadas → **RESOLVIDO** com migrations automáticas
2. ❌ Conexão híbrida → **RESOLVIDO** com db.js padronizado
3. ⚠️ Cache do navegador → Limpar cache (Ctrl+Shift+Del)

**Testes Adicionados**:
- Migrations agora cria TODAS as tabelas necessárias
- Insere permissões padrão automaticamente
- Cria perfis padrão (Admin, Operador, Cliente)

---

## 🚀 COMO EXECUTAR AS CORREÇÕES

### Opção 1: Auto-Migrations (Recomendado)
O servidor agora corrige automaticamente ao iniciar:

```powershell
cd central-resultados/backend
npm run dev
```

**Logs esperados**:
```
🔧 Iniciando verificação de migrations...
📋 Criando tabela configuracoes_sistema...
📋 Criando tabela permissoes...
📋 Criando tabela perfis...
📋 Adicionando coluna data_envio...
📋 Adicionando coluna caminho_arquivo...
📋 Adicionando colunas de cores extras...
✅ Migrations executadas com sucesso!
```

---

### Opção 2: Script Manual Node.js
Se preferir executar separadamente:

```powershell
cd central-resultados/backend
node corrigir-banco.js
```

**O que faz**:
- Adiciona todas as colunas faltantes
- Migra dados de `arquivo_path` para `caminho_arquivo`
- Verifica estrutura final

---

### Opção 3: SQL Manual (Backup)
Se Node.js falhar, execute direto no PostgreSQL:

1. Abrir pgAdmin ou psql
2. Conectar em `localhost:5432` → `central_resultados`
3. Executar arquivo `EXECUTAR_AQUI.sql`

```sql
-- Copie e cole no Query Tool
\i 'C:/caminho/para/EXECUTAR_AQUI.sql'
```

---

## 📋 Checklist Pré-Execução

Antes de iniciar o servidor, verifique:

### 1. PostgreSQL Rodando
```powershell
Get-Service | Where-Object {$_.Name -like "*postgres*"}
# Status: Running ✅
```

### 2. Arquivo .env Correto
```env
NODE_ENV=development
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=central_resultados
DATABASE_USER=postgres
DATABASE_PASSWORD=sua_senha

# ⚠️ REMOVA ESTA LINHA:
# DATABASE_URL=postgresql://...
```

### 3. Banco Existe
```sql
-- No psql ou pgAdmin:
SELECT current_database();
-- Deve retornar: central_resultados
```

### 4. Pasta Uploads
```powershell
Test-Path "central-resultados/backend/uploads"
# True ✅
```

---

## 🧪 Como Testar Após Correção

### Teste 1: Verificar Colunas
```powershell
cd central-resultados/backend
node corrigir-banco.js
```

**Saída esperada**:
```
✅ exames.data_envio (timestamp without time zone)
✅ exames_anexos.caminho_arquivo (character varying)
✅ configuracoes_sistema.cor_sucesso (character varying)
✅ configuracoes_sistema.cor_alerta (character varying)
✅ configuracoes_sistema.cor_perigo (character varying)
```

### Teste 2: Conexão Local
```powershell
cd central-resultados/backend
npm run dev
```

**Logs esperados**:
```
🔗 Usando configuração LOCAL (localhost)
📋 Config local: { host: 'localhost', port: 5432, database: 'central_resultados' }
✅ Conectado ao banco de dados PostgreSQL
```

**Se aparecer "yamabiko" ou "Railway"**:
❌ Ainda tem `DATABASE_URL` no `.env` → REMOVER!

### Teste 3: Upload de Anexo
1. Frontend → Exames → 📎
2. Upload PDF
3. **Esperado**: Arquivo aparece com ID, nome, data
4. **Se falhar**: Console (F12) → copiar erro

### Teste 4: Marcar Enviado
1. Exames → Botão "✗ Não" na coluna Enviado
2. Clicar → deve mudar para "✓ Sim"
3. Recarregar → status deve persistir

### Teste 5: Exportar Excel (Admin)
1. Login como Admin
2. Exames → 📊 Exportar Excel
3. **Esperado**: Excel com TODAS as colunas (Clínica, SOC, Enviado, etc)

### Teste 6: Logo
1. Configurações → Upload logo
2. Salvar
3. **Esperado**: Logo aparece na navbar
4. **Teste URL**: `http://localhost:8080/uploads/nome-arquivo.jpg`

---

## 🔍 Diagnóstico de Erros

### Erro: "column 'data_envio' does not exist"
```powershell
# Executar manualmente:
cd central-resultados/backend
node corrigir-banco.js
```

### Erro: "ENOTFOUND yamabiko" ou "pgbouncer"
```env
# Editar backend/.env e REMOVER:
# DATABASE_URL=...
```

### Erro: "Cannot read properties of undefined (reading 'id')"
✅ JÁ CORRIGIDO - `auth.js` agora define `req.user` e `req.usuario`

### Logo não aparece
```powershell
# 1. Verificar arquivo existe
Get-ChildItem backend/uploads

# 2. Testar acesso direto no navegador
# http://localhost:8080/uploads/1234567890-arquivo.jpg

# 3. Ver logs do backend
# Procurar: "📸 Logo recebida:"
```

### Permissões não carregam
1. Limpar cache do navegador (Ctrl+Shift+Del)
2. Verificar se tabelas existem:
   ```sql
   SELECT * FROM permissoes LIMIT 5;
   SELECT * FROM perfis LIMIT 5;
   ```
3. Se vazias, reiniciar servidor (migrations popula automaticamente)

---

## 📦 Arquivos Criados/Modificados

| Arquivo | Status | Descrição |
|---------|--------|-----------|
| `backend/src/database/migrations.js` | ✅ Modificado | Adicionadas verificações de colunas |
| `backend/corrigir-banco.js` | ✅ Novo | Script standalone de correção |
| `backend/EXECUTAR_AQUI.sql` | ✅ Novo | SQL manual para pgAdmin |
| `backend/correcao-colunas.sql` | ✅ Novo | SQL com verificações DO $$ |

---

## ✅ Status Final

- [x] Colunas faltantes adicionadas (data_envio, caminho_arquivo, cores)
- [x] Migrations atualizado para criar tudo automaticamente
- [x] db.js padronizado (localhost em dev, Railway em prod)
- [x] Express.static verificado (linha 38 do server.js)
- [x] Controllers padronizados (req.user e req.usuario)
- [x] Scripts de diagnóstico criados

---

## 🚀 Próximos Passos

1. **Parar servidor** (Ctrl+C)
2. **Editar .env** (remover DATABASE_URL)
3. **Iniciar servidor** (npm run dev)
4. **Ver logs** (deve aparecer "LOCAL (localhost)")
5. **Testar funcionalidades** (anexos, logo, exportação)

Se algum erro persistir após estas correções, envie:
- Screenshot do erro (F12)
- Logs completos do terminal backend
- Resultado de `node corrigir-banco.js`
