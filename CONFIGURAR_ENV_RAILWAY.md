# 🔧 CONFIGURAÇÃO DO .ENV - RAILWAY

## ✅ URL DO BANCO COPIADA

Sua URL do Railway:
```
postgresql://postgres:jFFqiEbuCJOqxXKzWJsWiQhNILdDQfas@yamabiko.proxy.rlwy.net:44128/railway
```

---

## 📝 PASSO A PASSO (1 MINUTO)

### **1. Abrir o arquivo `.env`**

No VS Code:

1. Clique na pasta `backend/` (no Explorer à esquerda)
2. Procure o arquivo `.env`
3. Clique duas vezes para abrir

**Se o arquivo não existir**:
- Clique com botão direito na pasta `backend/`
- **New File**
- Nome: `.env`

---

### **2. Copiar e colar este conteúdo**

**APAGUE TUDO** que estiver no arquivo e cole isto:

```env
DATABASE_URL=postgresql://postgres:jFFqiEbuCJOqxXKzWJsWiQhNILdDQfas@yamabiko.proxy.rlwy.net:44128/railway
NODE_ENV=production
JWT_SECRET=Tr0c4rP0rUm4Ch4v3S3gur4Al34t0r14
PORT=5000
ADMIN_EMAIL=admin@astassessoria.com.br
ADMIN_PASSWORD=Admin@2024
```

**⚠️ IMPORTANTE**: Cole exatamente como está acima, sem espaços antes ou depois das linhas.

---

### **3. Salvar o arquivo**

Pressione **Ctrl+S** para salvar.

---

## 🚀 EXECUTAR O SCRIPT

Agora que o `.env` está configurado, execute no terminal:

```powershell
cd backend
node criar-admin-producao.js
```

**Se der erro "Cannot find module 'pg'"**, execute antes:

```powershell
cd backend
npm install
node criar-admin-producao.js
```

---

## ✅ RESULTADO ESPERADO

O script vai mostrar:

```
🔧 CRIANDO USUÁRIO ADMIN NO RAILWAY

📡 Conectando no banco do Railway...
✅ Perfil Admin encontrado (ID: 1)
✅ USUÁRIO CRIADO COM SUCESSO!

🌐 CREDENCIAIS PARA LOGIN:
   📧 E-mail: admin@astassessoria.com.br
   🔑 Senha: Admin@2024
```

---

## 🌐 FAZER LOGIN NO SITE

Acesse: `https://resultados.astassessoria.com.br`

**Credenciais**:
- **E-mail**: `admin@astassessoria.com.br`
- **Senha**: `Admin@2024`

---

## 🔧 ERROS COMUNS

### **Erro: "ENOTFOUND yamabiko"**
→ Verifique se o `.env` foi salvo corretamente (Ctrl+S)

### **Erro: "Cannot find module 'pg'"**
→ Execute:
```powershell
cd backend
npm install
```

### **Erro: "Perfil Admin não existe"**
→ Migrations não rodaram. Vá no Railway e reinicie o backend.

---

**Abra o arquivo `backend/.env`, cole o conteúdo acima, salve (Ctrl+S) e execute o script!**
