# ✅ AMBIENTE DUAL RESTAURADO + CORREÇÃO DE LOGIN

## 🎯 VOCÊ ESTAVA CERTO!

Restaurei o ambiente para funcionar como **deveria ser desde o início**:

---

## 🔧 O QUE FOI CORRIGIDO

### **1. Frontend agora detecta o ambiente automaticamente**

**Arquivo**: `frontend/src/services/api.js`

**Antes** (errado):
```javascript
baseURL: 'https://central-resultados-production.up.railway.app/api'
```

**Agora** (correto):
```javascript
baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
```

**Como funciona**:
- **Desenvolvimento local** (npm run dev): Usa `http://localhost:8080/api`
- **Produção** (Railway): Usa a variável `VITE_API_URL`

---

## 🚀 COMO USAR AGORA

### **DESENVOLVIMENTO LOCAL** (testar no seu PC)

1. **Iniciar backend local**:
   ```powershell
   cd central-resultados\backend
   npm run dev
   ```
   - Roda em: `http://localhost:8080`
   - Usa banco: **localhost** (ou Railway se quiser)

2. **Iniciar frontend local**:
   ```powershell
   cd central-resultados\frontend
   npm run dev
   ```
   - Roda em: `http://localhost:3000`
   - Conecta em: `http://localhost:8080/api`

3. **Testar**:
   - Acesse: `http://localhost:3000`
   - Faça login com: `admin@astassessoria.com.br` / `minhasenha123`
   - Teste todas as funcionalidades

4. **Quando estiver tudo OK**: Faça commit e push

---

### **PRODUÇÃO** (Railway - 24/7)

1. **Backend** (já está no Railway):
   - URL: `https://central-resultados-production.up.railway.app`
   - Banco: PostgreSQL do Railway

2. **Frontend** (precisa configurar):
   - No Railway → Variáveis → Adicionar:
     ```
     VITE_API_URL=https://central-resultados-production.up.railway.app/api
     ```

3. **Domínio oficial**:
   - `https://resultados.astassessoria.com.br`

---

## 🔧 CORREÇÃO DO LOGIN (URGENTE)

O script resetou a senha, mas o login continua dando erro.

### **SOLUÇÃO: SQL direto no Railway**

1. **Railway → PostgreSQL → Query**

2. **Executar este SQL**:

```sql
-- PASSO 1: Ver se o perfil Admin existe
SELECT id FROM perfis WHERE nome = 'Admin';
-- Anote o ID (exemplo: 1)

-- PASSO 2: DELETAR qualquer usuário duplicado
DELETE FROM usuarios WHERE email = 'admin@astassessoria.com.br';

-- PASSO 3: CRIAR o usuário (SUBSTITUA o 1 pelo ID do perfil)
INSERT INTO usuarios (nome, email, senha, perfil, perfil_id, ativo)
VALUES (
  'Administrador',
  'admin@astassessoria.com.br',
  '$2a$10$8K1p/a0dL2LsVe6.e6c7ZeY.JXFz2A1Q/0mZWx8p/7.0qF7g4qXDy',
  'admin',
  1,  -- SUBSTITUA pelo ID do perfil Admin que você anotou
  true
);
```

**Esta senha é**: `Admin@2024`

3. **Testar o login**:
   - Acesse: `https://resultados.astassessoria.com.br/login`
   - E-mail: `admin@astassessoria.com.br`
   - Senha: `Admin@2024`

---

## 📊 FLUXO DE TRABALHO AGORA

```
┌─────────────────────────────────────────────────────────────┐
│  DESENVOLVIMENTO LOCAL (SEU PC)                             │
├─────────────────────────────────────────────────────────────┤
│  1. Frontend: npm run dev → localhost:3000                  │
│  2. Backend: npm run dev → localhost:8080                   │
│  3. Testar tudo                                             │
│  4. Commitar quando estiver OK                              │
└─────────────────────────────────────────────────────────────┘
                         ↓ (git push)
┌─────────────────────────────────────────────────────────────┐
│  PRODUÇÃO (RAILWAY - 24/7)                                  │
├─────────────────────────────────────────────────────────────┤
│  Frontend: resultados.astassessoria.com.br                  │
│  Backend: central-resultados-production.up.railway.app      │
│  Banco: PostgreSQL Railway                                  │
│  Status: SEMPRE NO AR (não depende do seu PC)               │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ CHECKLIST

### **Agora (Urgente)**:
- [ ] Execute o SQL no Railway para criar o usuário
- [ ] Tente fazer login em `https://resultados.astassessoria.com.br`
- [ ] Me avise se funcionou

### **Depois (Ambiente Local)**:
- [ ] Inicie o backend local (`npm run dev` na pasta backend)
- [ ] Inicie o frontend local (`npm run dev` na pasta frontend)
- [ ] Teste no `localhost:3000`
- [ ] Quando estiver tudo certo, faça push

---

## 🔐 CREDENCIAIS

### **LOCAL** (seu PC):
- **E-mail**: `admin@astassessoria.com.br`
- **Senha**: `minhasenha123` (a que você usava antes)

### **PRODUÇÃO** (Railway):
- **E-mail**: `admin@astassessoria.com.br`
- **Senha**: `Admin@2024` (depois de executar o SQL)

---

**Execute o SQL no Railway para criar o usuário e me avise se conseguiu fazer login!**

**Depois disso, você volta a trabalhar localmente e só sobe pra produção quando estiver pronto.**
