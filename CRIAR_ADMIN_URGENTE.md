# 🚨 SOLUÇÃO URGENTE - CRIAR ADMIN NO RAILWAY

## ❌ PROBLEMA
- Banco **LOCAL** (seu PC): tem usuário `admin@astassessoria.com.br` com senha `minhasenha123`
- Banco **RAILWAY** (produção): está **VAZIO**, sem nenhum usuário

**Por isso não consegue logar na web!**

---

## ✅ SOLUÇÃO (3 MINUTOS)

### **PASSO 1: Abrir terminal no VS Code**
1. Abra o VS Code
2. Pressione `` Ctrl + ` `` (abre terminal)
3. Digite:
```powershell
cd backend
```

---

### **PASSO 2: Configurar DATABASE_URL do Railway**

Você precisa ter um arquivo `.env` na pasta `backend/` com a URL do banco do Railway.

**CRIE OU EDITE** o arquivo `backend/.env` e coloque:

```env
# COPIE A URL DO SEU BANCO NO RAILWAY
DATABASE_URL=postgresql://postgres:SUA_SENHA@yamabiko.proxy.rlwy.net:PORTA/railway

NODE_ENV=production
```

**⚠️ IMPORTANTE**: 
- Vá no Railway → Aba **Data** (PostgreSQL)
- Copie a **Connection String** completa
- Cole no `.env` como `DATABASE_URL`

Exemplo real:
```env
DATABASE_URL=postgresql://postgres:AbCd1234XyZ@yamabiko.proxy.rlwy.net:54321/railway
NODE_ENV=production
```

---

### **PASSO 3: Executar o script**

No terminal do VS Code (ainda dentro da pasta `backend/`):

```powershell
node criar-admin-producao.js
```

---

### **PASSO 4: Resultado Esperado**

O script vai:

1. Conectar no banco do Railway
2. Verificar se o admin existe
3. Se **NÃO existir**: Criar com as credenciais padrão
4. Se **JÁ existir**: Resetar a senha para `Admin@2024`

**Saída esperada**:
```
🔧 CRIANDO USUÁRIO ADMIN NO RAILWAY

📡 Conectando no banco do Railway...

1️⃣ Verificando se o admin já existe...

2️⃣ Buscando perfil Admin...
✅ Perfil Admin encontrado (ID: 1)

3️⃣ Criando usuário administrador...
✅ USUÁRIO CRIADO COM SUCESSO!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ID: 1
   Nome: Administrador
   E-mail: admin@astassessoria.com.br
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌐 CREDENCIAIS PARA LOGIN:
   📧 E-mail: admin@astassessoria.com.br
   🔑 Senha: Admin@2024

⚠️  IMPORTANTE: Altere a senha após o primeiro login!

✅ Concluído! Tente fazer login agora.
```

---

### **PASSO 5: Fazer Login no Site**

1. Acesse: `https://resultados.astassessoria.com.br/login`
2. Use as credenciais:
   - **E-mail**: `admin@astassessoria.com.br`
   - **Senha**: `Admin@2024`

---

## 🔧 ERROS COMUNS

### **Erro: "ENOTFOUND yamabiko"**
**Causa**: `DATABASE_URL` não está configurada ou está errada.

**Solução**:
1. Railway → Data → PostgreSQL
2. Copie a **Connection String**
3. Cole no `backend/.env` como `DATABASE_URL`

---

### **Erro: "Perfil Admin não existe"**
**Causa**: Migrations não rodaram no Railway.

**Solução**:
1. Railway → Backend → **Restart**
2. Aguarde as migrations rodarem
3. Execute o script novamente

---

### **Erro: "Cannot find module 'bcryptjs'"**
**Solução**:
```powershell
cd backend
npm install
```

---

## 🎯 RESUMO RÁPIDO

```powershell
# 1. Configurar .env
notepad backend\.env
# Cole:
# DATABASE_URL=postgresql://postgres:senha@yamabiko.proxy.rlwy.net:porta/railway
# NODE_ENV=production

# 2. Executar script
cd backend
node criar-admin-producao.js

# 3. Fazer login no site
# E-mail: admin@astassessoria.com.br
# Senha: Admin@2024
```

---

## 📞 AINDA NÃO FUNCIONA?

**Se o script falhar**, vou criar o usuário DIRETO no banco via SQL:

1. Railway → Data → Query
2. Copie e cole este SQL:

```sql
-- 1. Ver se o perfil Admin existe
SELECT id FROM perfis WHERE nome = 'Admin';
-- Anote o ID (exemplo: 1)

-- 2. Criar o usuário (SUBSTITUA o 1 pelo ID do perfil)
INSERT INTO usuarios (nome, email, senha, perfil, perfil_id, ativo)
VALUES (
  'Administrador',
  'admin@astassessoria.com.br',
  '$2a$10$8K1p/a0dL2LsVe6.e6c7ZeY.JXFz2A1Q/0mZWx8p/7.0qF7g4qXDy',
  'admin',
  1,  -- SUBSTITUA pelo ID do perfil Admin
  true
);
```

3. Execute o SQL
4. Tente logar com:
   - **E-mail**: `admin@astassessoria.com.br`
   - **Senha**: `Admin@2024`

---

**Execute o script e me avise o resultado!**
