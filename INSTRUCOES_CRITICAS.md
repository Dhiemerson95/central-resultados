# ⚠️ INSTRUÇÕES CRÍTICAS - LEIA ANTES DE INICIAR

## 🚨 PROBLEMA DETECTADO: Você está conectando no Railway!

Verifiquei os logs e o sistema está conectando em:
```
host: 'yamabiko.proxy.rlwy.net'
port: '44128'
database: 'railway'
```

**ISSO É ERRADO EM DESENVOLVIMENTO LOCAL!**

---

## ✅ CORREÇÃO OBRIGATÓRIA DO .env

### Passo 1: Editar backend/.env

Abra o arquivo `central-resultados/backend/.env` e **DELETE** ou **COMENTE** a linha `DATABASE_URL`:

```env
# ❌ REMOVA OU COMENTE ESTAS LINHAS:
# DATABASE_URL=postgresql://postgres:...@yamabiko.proxy.rlwy.net:44128/railway
# USE_RAILWAY=true

# ✅ MANTENHA APENAS ISTO:
NODE_ENV=development
PORT=5000

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=central_resultados
DATABASE_USER=postgres
DATABASE_PASSWORD=sua_senha_local

JWT_SECRET=sua_chave_secreta
UPLOAD_DIR=uploads
```

### Passo 2: Verificar Conexão

Execute:
```powershell
cd central-resultados/backend
node verificar-colunas-anexos.js
```

**Saída correta**:
```
📋 Config local: {
  host: 'localhost',      ← DEVE SER localhost!
  port: 5432,
  database: 'central_resultados',
  user: 'postgres'
}
```

**Se ainda aparecer "yamabiko"**:
1. Feche o terminal
2. Abra novo terminal
3. `cd central-resultados/backend`
4. Verifique `.env` novamente
5. `node verificar-colunas-anexos.js`

---

## 📋 Correções Já Aplicadas

### 1. ✅ Conflito de Nomes no Banco
- `anexosController.js` já usa `caminho_arquivo` (correto)
- `migrations.js` atualizado para:
  - Tornar `arquivo_path` opcional (se existir)
  - Criar `caminho_arquivo` automaticamente
  - Migrar dados de um para outro

### 2. ✅ Persistência da Logo
- `server.js` linha 38-40: Log mostra caminho correto
- Express.static configurado corretamente

### 3. ✅ Filtro Inicial Inteligente
- `examesController.js` linha 32-37:
  - Se não há filtro de data → busca apenas hoje
  - Mensagem natural do backend: se retornar array vazio, frontend mostra "Nenhum exame lançado nesta data"
  - Usuário pode filtrar outras datas normalmente

### 4. ✅ CORS
- `server.js` linha 23-34:
  - `localhost:3000` ✅
  - `localhost:5173` ✅
  - `localhost:8080` ✅
  - Domínio produção ✅

---

## 🧪 Como Testar Após Corrigir .env

### Teste 1: Verificar Conexão Local
```powershell
cd central-resultados/backend
node verificar-colunas-anexos.js
```
✅ Deve conectar em **localhost**, não "yamabiko"

### Teste 2: Iniciar Servidor
```powershell
npm run dev
```

**Logs esperados**:
```
🔗 Usando configuração LOCAL (localhost)
📋 Config local: { host: 'localhost', port: 5432, ... }
📁 Servindo arquivos estáticos de: C:\...\backend\uploads
✅ Conectado ao banco de dados PostgreSQL
🔄 Iniciando verificação de migrations...
📋 Ajustando estrutura da tabela exames_anexos...
✅ Migrations executadas com sucesso!
🚀 Servidor rodando na porta 5000
```

### Teste 3: Carregar Exames
1. Abrir frontend: `http://localhost:5173`
2. Fazer login
3. Ir em Exames
4. **Esperado**: Carrega apenas exames de hoje
5. **Se vazio**: Mostra "Nenhum exame lançado nesta data até o momento"
6. **Filtrar data passada**: Deve funcionar normalmente

### Teste 4: Upload Anexo
1. Exames → 📎
2. Upload PDF
3. **Esperado**: Arquivo salvo com `caminho_arquivo` no banco
4. **Se erro 23502**: Ainda conectando no Railway (volte ao Passo 1)

### Teste 5: Logo
1. Configurações → Upload logo
2. Salvar
3. Logo aparece na navbar
4. F5 (refresh)
5. **Esperado**: Logo permanece visível
6. **Testar URL**: `http://localhost:8080/uploads/nome-arquivo.jpg`

---

## 🔍 Diagnóstico de Erros

### Erro: "column 'arquivo_path' violates not-null"
**Causa**: Ainda conectando no Railway (banco antigo)
**Solução**: Remover `DATABASE_URL` do `.env` local

### Erro: "ENOTFOUND yamabiko"
**Causa**: `.env` ainda tem `DATABASE_URL`
**Solução**: 
```powershell
# Verificar se ainda existe:
Select-String -Path "backend/.env" -Pattern "DATABASE_URL"

# Se retornar algo, editar e comentar a linha
```

### Logo desaparece no F5
**Causa**: Caminho relativo errado
**Solução**: Já corrigido - `server.js` agora loga o caminho absoluto

### "Nenhum exame encontrado" mesmo com exames
**Causa**: Filtro de data hoje vazio
**Solução**: Funcionando corretamente! Adicione um exame com data de hoje ou filtre outra data

---

## ✅ Checklist Final

Antes de testar:

- [ ] Editei `backend/.env`
- [ ] Removi/comentei `DATABASE_URL`
- [ ] Salvei o arquivo
- [ ] Fechei e reabri o terminal
- [ ] Executei `node verificar-colunas-anexos.js`
- [ ] Saída mostra `host: 'localhost'`
- [ ] PostgreSQL local está rodando
- [ ] Executei `npm run dev`
- [ ] Logs mostram "LOCAL (localhost)"

---

## 📦 Arquivos Modificados

1. ✅ `backend/src/controllers/examesController.js` - Filtro data hoje
2. ✅ `backend/src/database/migrations.js` - Ajuste caminho_arquivo
3. ✅ `backend/src/server.js` - Log do caminho uploads
4. ✅ `backend/verificar-colunas-anexos.js` - Script de verificação (NOVO)

---

## 🚀 Resumo

**O QUE VOCÊ DEVE FAZER AGORA**:

1. **EDITAR** `backend/.env` → Remover `DATABASE_URL`
2. **REINICIAR** terminal
3. **EXECUTAR** `node verificar-colunas-anexos.js`
4. **VERIFICAR** que conecta em `localhost`
5. **INICIAR** servidor: `npm run dev`
6. **TESTAR** funcionalidades

**Todas as correções de código já foram aplicadas!**
O único problema restante é a variável `DATABASE_URL` no seu `.env` local.
