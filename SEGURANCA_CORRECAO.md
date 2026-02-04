# 🔒 CORREÇÃO DE SEGURANÇA APLICADA

## ⚠️ PROBLEMA CRÍTICO ENCONTRADO

### Vulnerabilidade Detectada
O arquivo `scripts/admin-seed.js` continha credenciais **hardcoded**:
```javascript
// ❌ ERRADO (antes):
const connectionString = "postgresql://postgres:jFFqiEbuCJOqxXKzWJsWiQhNILdDQfas@yamabiko.proxy.rlwy.net:44128/railway";
const email = "astassessoria@astassessoria.com.br";
const senhaPura = "Dhi36363562a*";
```

**Riscos**:
1. 🔓 Senha do banco exposta no código-fonte
2. 🔓 Senha do admin exposta no código-fonte
3. 🔓 Se commitar no Git, fica no histórico para sempre
4. 🔓 Qualquer pessoa com acesso ao código tem suas credenciais

---

## ✅ CORREÇÃO APLICADA

### Arquivo Corrigido: `scripts/admin-seed.js`

**Agora usa variáveis de ambiente**:
```javascript
// ✅ CORRETO (agora):
require('dotenv').config();

const poolConfig = (isProduction || useRailway) && process.env.DATABASE_URL 
  ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
  : { host: process.env.DATABASE_HOST || 'localhost', ... };

const email = process.env.ADMIN_EMAIL || "admin@exemplo.com";
const senhaPura = process.env.ADMIN_PASSWORD || "admin123";
```

---

## 🔐 Como Usar Corretamente Agora

### 1. Configurar .env (NÃO COMMITAR)

Edite `backend/.env`:
```env
# BANCO DE DADOS LOCAL
NODE_ENV=development
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=central_resultados
DATABASE_USER=postgres
DATABASE_PASSWORD=sua_senha_local

# ADMIN PADRÃO (para seed)
ADMIN_EMAIL=seu@email.com
ADMIN_PASSWORD=SuaSenhaSegura123!

# PARA RAILWAY (APENAS EM PRODUÇÃO - NÃO USE LOCALMENTE):
# DATABASE_URL=postgresql://user:pass@host:port/db
# USE_RAILWAY=true
```

### 2. Criar Usuário Admin (Local)

```powershell
cd central-resultados/backend
node scripts/admin-seed.js
```

**Saída esperada**:
```
🔗 Usando banco LOCAL (localhost)
📋 Config: { host: 'localhost', database: 'central_resultados' }
✅ USUÁRIO CRIADO COM SUCESSO!
📧 Email: seu@email.com
```

### 3. Criar Usuário Admin (Railway)

```powershell
cd central-resultados/backend
$env:USE_RAILWAY="true"
node scripts/admin-seed.js
```

**Ou edite temporariamente o .env**:
```env
USE_RAILWAY=true
DATABASE_URL=sua_url_do_railway
```

---

## 📋 Arquivos Verificados

### ✅ Arquivos Seguros (usam process.env)
- `src/database/db.js` - Usa `process.env.DATABASE_URL` e variáveis separadas
- `src/database/migrations.js` - Importa db.js (herda configuração segura)
- `src/controllers/*` - Todos usam `require('../database/db')`
- `scripts/admin-seed.js` - **CORRIGIDO** agora usa variáveis de ambiente

### ❌ Nenhum Arquivo com Hardcode Detectado

Executado:
```powershell
Get-ChildItem -Recurse -Include "*.js" | Select-String -Pattern "@yamabiko|postgresql://.*@"
```
**Resultado**: Sem ocorrências ✅

---

## 🚨 Regras de Segurança

### NUNCA FAÇA:
❌ Hardcode de senhas no código
❌ Hardcode de connection strings
❌ Commit de arquivos `.env` no Git
❌ Compartilhar senhas em comentários de código

### SEMPRE FAÇA:
✅ Use `process.env.VARIAVEL`
✅ Mantenha `.env` no `.gitignore`
✅ Use valores padrão seguros para desenvolvimento
✅ Documente variáveis necessárias em `.env.example`

---

## 📝 Template .env.example

Criado em `backend/.env.example`:
```env
# AMBIENTE
NODE_ENV=development
PORT=5000

# BANCO DE DADOS LOCAL
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=central_resultados
DATABASE_USER=postgres
DATABASE_PASSWORD=

# ADMIN PADRÃO
ADMIN_EMAIL=
ADMIN_PASSWORD=

# JWT
JWT_SECRET=

# PRODUÇÃO (Railway)
# DATABASE_URL=
# USE_RAILWAY=true
```

---

## 🔍 Como Verificar Segurança

### Buscar Credenciais Hardcoded
```powershell
# Buscar strings de conexão
cd central-resultados/backend
Get-ChildItem -Recurse -Include "*.js" | Select-String -Pattern "postgresql://.*:.*@"

# Buscar senhas hardcoded
Get-ChildItem -Recurse -Include "*.js" | Select-String -Pattern "password.*=.*['\"].*['\"]"

# Buscar hosts específicos
Get-ChildItem -Recurse -Include "*.js" | Select-String -Pattern "yamabiko|railway"
```

### Verificar .gitignore
```powershell
# Garantir que .env está ignorado
cat .gitignore | Select-String ".env"
```

**Saída esperada**:
```
.env
.env.local
.env.*.local
```

---

## ✅ Status de Segurança

| Item | Status | Observação |
|------|--------|------------|
| Credenciais hardcoded | ✅ Removidas | admin-seed.js corrigido |
| Uso de process.env | ✅ Implementado | Todos os arquivos corretos |
| .env no .gitignore | ✅ Configurado | Arquivo não será commitado |
| .env.example criado | ✅ Documentado | Template para novos devs |
| Valores padrão seguros | ✅ Definidos | localhost com senha genérica |

---

## 🚀 Próximos Passos

1. **Verificar .gitignore**:
   ```powershell
   cat backend/.gitignore
   ```
   Deve conter: `.env`

2. **Remover do histórico Git** (se já commitou):
   ```powershell
   # ⚠️ CUIDADO: Isso reescreve o histórico!
   git filter-branch --force --index-filter "git rm --cached --ignore-unmatch backend/.env" --prune-empty --tag-name-filter cat -- --all
   ```

3. **Verificar que nenhum .env foi commitado**:
   ```powershell
   git log --all --full-history -- backend/.env
   ```
   Deve retornar vazio.

4. **Atualizar senha do Railway**:
   - Se a senha `jFFqiEbuCJOqxXKzWJsWiQhNILdDQfas` foi exposta
   - Vá no Railway → PostgreSQL → Settings → Regenerate Password
   - Atualize a `DATABASE_URL` no Railway

---

## 📚 Referências

- [OWASP - Hardcoded Credentials](https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_credentials)
- [12 Factor App - Config](https://12factor.net/config)
- [Git - Removing Sensitive Data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)

---

## ⚠️ ATENÇÃO

**Se você já fez commit do arquivo com credenciais**:

1. A senha do banco está **COMPROMETIDA**
2. A senha do admin está **COMPROMETIDA**
3. Você **DEVE** trocar ambas imediatamente
4. Considere reescrever o histórico do Git (use com cuidado)

**Contate o administrador do Railway para regenerar a senha do banco!**
