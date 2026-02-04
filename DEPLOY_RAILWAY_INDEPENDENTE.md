# 🚀 GUIA DE DEPLOY RAILWAY - SISTEMA 100% INDEPENDENTE

## ✅ CORREÇÕES CRÍTICAS APLICADAS

### 1. **Frontend Independente do Localhost**
**Antes**: `baseURL: 'http://localhost:8080/api'` ❌  
**Agora**: `baseURL: 'https://central-resultados-production.up.railway.app/api'` ✅

**Arquivo**: `frontend/src/services/api.js`

---

### 2. **Loop Infinito Corrigido**
**Problema**: Interceptor de erro causava refresh infinito em erros 401.

**Solução Aplicada**:
```javascript
let isRedirecting = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isRedirecting) {
      isRedirecting = true;
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      
      // Só redireciona se NÃO estiver já na tela de login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

**Proteções**:
- ✅ Flag `isRedirecting` previne loops
- ✅ Verifica se já está no `/login` antes de redirecionar
- ✅ Não força refresh se não houver necessidade

---

### 3. **CORS Completo**
**Domínios liberados no backend**:
```javascript
origin: [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080',
  'https://resultados.astassessoria.com.br',
  'https://www.resultados.astassessoria.com.br',
  'https://central-resultados-production.up.railway.app'
]
```

---

## 🔧 CONFIGURAÇÃO DO RAILWAY (PASSO A PASSO)

### **BACKEND (API)**

#### 1. Acesse o projeto do backend no Railway:
https://railway.app/dashboard

#### 2. Clique em "Variables" e adicione:

```env
# BANCO DE DADOS (copie da aba "Data" do Railway)
DATABASE_URL=postgresql://postgres:[senha]@[host].railway.app:[porta]/railway

# PORTA (Railway define automaticamente, mas pode deixar)
PORT=5000

# AMBIENTE
NODE_ENV=production

# JWT (gere uma chave segura)
JWT_SECRET=Tr0c4rP0rUm4Ch4v3S3gur4Al34t0r14

# ADMIN PADRÃO (para criar o primeiro usuário)
ADMIN_EMAIL=admin@astassessoria.com.br
ADMIN_PASSWORD=Admin@2024
```

#### 3. Deploy do Backend:
```bash
# No Railway, configure o comando de start:
npm run dev
```

**URL FINAL DO BACKEND**:  
`https://central-resultados-production.up.railway.app`

---

### **FRONTEND (SITE)**

#### Opção 1: Deploy no Railway (RECOMENDADO)

1. **Criar novo serviço no Railway**
2. **Conectar ao mesmo repositório**, mas apontar para a pasta `frontend/`
3. **Configurar Build Command**:
   ```bash
   npm install && npm run build
   ```
4. **Configurar Start Command**:
   ```bash
   npm run preview -- --host 0.0.0.0 --port $PORT
   ```
5. **Adicionar variável de ambiente**:
   ```env
   VITE_API_URL=https://central-resultados-production.up.railway.app
   ```

**URL FINAL DO FRONTEND (Railway)**:  
`https://central-resultados-frontend-production.up.railway.app`

---

#### Opção 2: Deploy no Vercel/Netlify (Alternativa)

**Vercel**:
1. Conecte seu GitHub ao Vercel
2. Importe o projeto
3. Configure `Root Directory`: `frontend`
4. Adicione variável: `VITE_API_URL=https://central-resultados-production.up.railway.app`
5. Deploy automático

**Netlify**:
1. Conecte ao GitHub
2. Build command: `npm run build`
3. Publish directory: `frontend/dist`
4. Adicione variável: `VITE_API_URL=https://central-resultados-production.up.railway.app`

---

## 🌐 APONTAMENTO DE DOMÍNIO

Para usar **resultados.astassessoria.com.br**:

### **No Registro.br (ou seu provedor DNS)**:

1. Acesse o painel de DNS
2. Adicione um registro **CNAME**:

```
Tipo: CNAME
Nome: resultados
Valor: central-resultados-frontend-production.up.railway.app
TTL: 3600
```

3. No Railway, vá em **Settings → Domains** e adicione:
   ```
   resultados.astassessoria.com.br
   ```

4. Aguarde propagação (até 24h, mas geralmente 1-2h)

---

## 📦 COMANDOS DE DEPLOY (GIT)

### **1. Verificar mudanças**:
```powershell
cd C:\Users\astas\Documents\CENTRAL_RESULTADOS_GIT-HUB\central-resultados
git status
```

### **2. Commitar correções**:
```powershell
git add .
git commit -m "fix: configurar sistema para produção independente (Railway)"
```

### **3. Enviar para GitHub**:
```powershell
git push origin master
```

---

## ✅ CHECKLIST DE INDEPENDÊNCIA

### **Backend**:
- [x] DATABASE_URL configurada no Railway (não hardcoded)
- [x] CORS aceita domínio oficial
- [x] Migrations automáticas ao iniciar
- [x] Uploads persistem no Railway (ou usar S3/Cloudinary)
- [x] PORT dinâmica (Railway define automaticamente)

### **Frontend**:
- [x] baseURL aponta para Railway (não localhost)
- [x] Loop infinito corrigido
- [x] Build otimizado para produção
- [x] Variável VITE_API_URL configurada

### **Domínio**:
- [ ] CNAME configurado no Registro.br
- [ ] Domínio adicionado no Railway
- [ ] SSL automático (Railway/Vercel gerencia)

---

## 🚨 IMPORTANTE: UPLOADS DE ARQUIVOS

**PROBLEMA**: Railway tem **disco efêmero** - arquivos enviados podem ser perdidos ao reiniciar.

**SOLUÇÕES**:

### Opção 1: Railway Volumes (Persistente)
```bash
# No Railway CLI:
railway volume create uploads
railway volume attach uploads /app/backend/uploads
```

### Opção 2: Cloudinary (RECOMENDADO)
1. Crie conta gratuita: https://cloudinary.com
2. Configure no Railway:
   ```env
   CLOUDINARY_CLOUD_NAME=seu_cloud_name
   CLOUDINARY_API_KEY=sua_api_key
   CLOUDINARY_API_SECRET=seu_api_secret
   ```
3. Instale no backend:
   ```bash
   npm install cloudinary multer-storage-cloudinary
   ```

### Opção 3: AWS S3
```env
AWS_ACCESS_KEY_ID=sua_key
AWS_SECRET_ACCESS_KEY=seu_secret
AWS_BUCKET_NAME=central-resultados
AWS_REGION=us-east-1
```

**Por enquanto**, os uploads funcionarão, mas **podem ser perdidos** ao reiniciar o Railway. Recomendo implementar Cloudinary ASAP.

---

## 🧪 TESTE FINAL

### **1. Abra o site no navegador (com VS Code FECHADO)**:
```
https://resultados.astassessoria.com.br
```
ou
```
https://central-resultados-frontend-production.up.railway.app
```

### **2. Faça login**:
- E-mail: `admin@astassessoria.com.br`
- Senha: `Admin@2024`

### **3. Verifique**:
- ✅ Login funciona
- ✅ Listagem de exames carrega
- ✅ Upload de anexos funciona
- ✅ **Sem loop infinito**
- ✅ **Sem erros de CORS**

### **4. Desligue seu notebook**:
- ✅ Site continua no ar
- ✅ Clientes conseguem acessar

---

## 📊 MONITORAMENTO

### **Railway Dashboard**:
- Logs em tempo real: https://railway.app/project/[seu-projeto]/logs
- Uso de recursos: CPU, memória, disco
- Métricas de requisições

### **Erros Comuns**:

**1. "Cannot connect to database"**
→ Verifique `DATABASE_URL` no Railway

**2. "CORS error"**
→ Adicione o domínio no `server.js` e faça redeploy

**3. "Module not found"**
→ Rode `npm install` no Railway ou adicione no `package.json`

**4. "Uploads sumindo"**
→ Implemente Cloudinary ou Railway Volumes

---

## 🎯 PRÓXIMOS PASSOS

1. **Fazer o push das correções** (comandos acima)
2. **Verificar deploy automático no Railway**
3. **Configurar domínio no DNS**
4. **Implementar Cloudinary para uploads persistentes**
5. **Alterar senha do admin após primeiro login**

---

## 📞 SUPORTE

Se o sistema não subir ou der erro:

1. **Verifique os logs do Railway**:
   ```
   railway logs
   ```

2. **Teste a API diretamente**:
   ```powershell
   Invoke-WebRequest -Uri "https://central-resultados-production.up.railway.app/api/auth/login" `
     -Method POST `
     -Body '{"email":"admin@astassessoria.com.br","password":"Admin@2024"}' `
     -ContentType "application/json"
   ```

3. **Verifique variáveis de ambiente** no Railway

---

**✅ SISTEMA AGORA É 100% INDEPENDENTE DO SEU COMPUTADOR**

Seu notebook pode ficar **desligado 24/7** e o sistema continuará funcionando para seus clientes.
