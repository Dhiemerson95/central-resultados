# 🔧 CORREÇÃO DE CONEXÃO LOCAL - APLICADA

## ❌ Problema Anterior
O sistema estava forçando o uso de `DATABASE_URL` sempre que ela existia no `.env`, causando erro `ENOTFOUND` no desenvolvimento local.

## ✅ Correção Aplicada

### Arquivo Modificado: `backend/src/database/db.js`

**Nova Lógica**:
```javascript
const isProduction = process.env.NODE_ENV === 'production';
const useRailway = process.env.USE_RAILWAY === 'true';

// Só usa DATABASE_URL se:
// 1. NODE_ENV === 'production' (Railway detecta automaticamente)
// 2. OU USE_RAILWAY === 'true' (forçar Railway localmente)

if ((isProduction || useRailway) && process.env.DATABASE_URL) {
  // Conexão Railway
} else {
  // Conexão localhost (PADRÃO)
  host: 'localhost',
  port: 5432,
  database: 'central_resultados',
  user: 'postgres',
  password: 'postgres'
}
```

---

## 🎯 Como Funciona Agora

### 🏠 Desenvolvimento Local (Padrão)
```powershell
cd backend
npm run dev
```
**Resultado**: Conecta em `localhost:5432` automaticamente

**Mensagem no console**:
```
🔗 Usando configuração LOCAL (localhost)
📋 Config local: { host: 'localhost', port: 5432, database: 'central_resultados' }
✅ Conectado ao banco de dados PostgreSQL
```

### ☁️ Produção Railway
```powershell
# No Railway, a variável NODE_ENV é automaticamente 'production'
```
**Resultado**: Usa `DATABASE_URL` automaticamente

**Mensagem no console**:
```
🔗 Usando DATABASE_URL para conexão (Railway/Produção)
✅ Conectado ao banco de dados PostgreSQL
```

---

## 🔧 Configuração do .env Local

Edite `backend/.env` e **remova/comente** a linha `DATABASE_URL`:

```env
# AMBIENTE
NODE_ENV=development
PORT=5000

# BANCO LOCAL (usado por padrão em dev)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=central_resultados
DATABASE_USER=postgres
DATABASE_PASSWORD=sua_senha_aqui

# JWT
JWT_SECRET=sua_chave_secreta

# REMOVA OU COMENTE ESTA LINHA (só deve existir no Railway):
# DATABASE_URL=postgresql://...
```

---

## 🧪 Testar Conexão

Execute o script de diagnóstico:
```powershell
cd backend
node testar-conexao.js
```

**Saída esperada**:
```
🔍 DIAGNÓSTICO DE CONEXÃO

📋 Variáveis de Ambiente:
  NODE_ENV: development
  USE_RAILWAY: (não definida)
  DATABASE_URL: (não definida)
  DATABASE_HOST: localhost
  DATABASE_PORT: 5432
  DATABASE_NAME: central_resultados
  DATABASE_USER: postgres
  DATABASE_PASSWORD: ****** (DEFINIDA)

🎯 Modo de Conexão:
  🏠 LOCAL (localhost)

🔧 Testando Conexão...

✅ CONEXÃO BEM-SUCEDIDA!

📊 Informações do Banco:
   Versão PostgreSQL: PostgreSQL 14.x
   Database: central_resultados
   Usuário: postgres

✅ Teste finalizado com sucesso!
```

---

## 🚨 Se der erro "ENOTFOUND" ou "ECONNREFUSED"

### Passo 1: Verificar se PostgreSQL está rodando
```powershell
# Listar serviços PostgreSQL
Get-Service | Where-Object {$_.Name -like "*postgres*"}

# Iniciar serviço
Start-Service postgresql-x64-14  # (ajustar para sua versão)
```

### Passo 2: Verificar se o banco existe
```sql
-- Conecte no pgAdmin ou psql e execute:
CREATE DATABASE central_resultados;
```

### Passo 3: Verificar senha
- Abra pgAdmin
- Tente conectar em `localhost:5432`
- Se pedir senha, use a mesma no `.env`

### Passo 4: Remover DATABASE_URL do .env local
```env
# COMENTE ou REMOVA esta linha:
# DATABASE_URL=postgresql://...
```

---

## 🎯 Forçar Railway Localmente (para testes)

Se quiser testar a conexão Railway no seu PC:
```powershell
cd backend
$env:USE_RAILWAY="true"
npm run dev
```
**Atenção**: Isso consumirá seu banco de produção!

---

## 📦 Arquivos Criados/Modificados

1. ✅ `backend/src/database/db.js` - **MODIFICADO** (nova lógica)
2. ✅ `backend/testar-conexao.js` - **CRIADO** (script de diagnóstico)
3. ✅ `backend/CONEXAO_BANCO.md` - **CRIADO** (documentação)

---

## 🚀 Próximos Passos

1. **Editar .env**:
   - Remover/comentar `DATABASE_URL`
   - Configurar senha local do PostgreSQL

2. **Testar**:
   ```powershell
   cd backend
   node testar-conexao.js
   ```

3. **Iniciar servidor**:
   ```powershell
   npm run dev
   ```

4. **Verificar logs**:
   - Deve aparecer: `🔗 Usando configuração LOCAL (localhost)`
   - Se aparecer Railway, ainda há algo errado no `.env`

---

## ✅ Status

- [x] Lógica de conexão corrigida
- [x] Prioridade para localhost em desenvolvimento
- [x] Script de diagnóstico criado
- [x] Documentação criada
- [ ] Usuário precisa editar `.env` e remover `DATABASE_URL`
- [ ] Usuário precisa testar com `node testar-conexao.js`
