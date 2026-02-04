# 🚨 CORREÇÃO URGENTE - LOGIN NÃO FUNCIONA

## ❌ PROBLEMA

O script resetou a senha, mas o login continua dando erro.

**Possíveis causas**:
1. Usuário foi criado mas com erro no hash da senha
2. Perfil ou permissões estão errados
3. JWT não está gerando corretamente

---

## ✅ SOLUÇÃO DIRETA NO RAILWAY

### **PASSO 1: Ir no Railway**

1. Railway → PostgreSQL → **Query**

---

### **PASSO 2: Ver se o usuário existe**

Execute este SQL:

```sql
SELECT id, nome, email, perfil, ativo, perfil_id 
FROM usuarios 
WHERE email = 'admin@astassessoria.com.br';
```

**Se retornar vazio**: Usuário não existe (pule para PASSO 4)  
**Se retornar dados**: Anote o `id` e vá para PASSO 3

---

### **PASSO 3: RESETAR a senha manualmente**

Execute este SQL (SUBSTITUA `1` pelo ID do usuário):

```sql
UPDATE usuarios 
SET senha = '$2a$10$8K1p/a0dL2LsVe6.e6c7ZeY.JXFz2A1Q/0mZWx8p/7.0qF7g4qXDy',
    ativo = true
WHERE id = 1;
```

**Esta senha é**: `Admin@2024`

---

### **PASSO 4: Se o usuário NÃO existir, criar do zero**

Execute este SQL:

```sql
-- 1. Ver o ID do perfil Admin
SELECT id FROM perfis WHERE nome = 'Admin';
-- Anote o ID (exemplo: 1)

-- 2. DELETAR qualquer usuário com este e-mail (se houver)
DELETE FROM usuarios WHERE email = 'admin@astassessoria.com.br';

-- 3. CRIAR o usuário (SUBSTITUA o 1 pelo ID do perfil)
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

---

## 🧪 TESTAR O LOGIN

Acesse: `https://resultados.astassessoria.com.br/login`

**Credenciais**:
- **E-mail**: `admin@astassessoria.com.br`
- **Senha**: `Admin@2024`

---

## ❌ SE AINDA NÃO FUNCIONAR

**Problema pode ser no backend**. Vamos verificar:

### **Verificar logs do Railway**

1. Railway → Backend → **Deployments**
2. Clique no deploy ativo
3. Role os logs e procure por erros de JWT ou autenticação

---

## 🔧 SOLUÇÃO 2: AMBIENTE LOCAL + PRODUÇÃO

Você está **100% correto**. Vamos restaurar o ambiente dual:

### **Como deveria funcionar**:

1. **Desenvolvimento Local**:
   - Frontend roda em `http://localhost:3000`
   - Backend roda em `http://localhost:8080`
   - Banco de dados: PostgreSQL local (ou Railway se preferir)
   - Você testa **tudo aqui** antes de subir

2. **Produção (Railway)**:
   - Frontend em `https://resultados.astassessoria.com.br`
   - Backend em `https://central-resultados-production.up.railway.app`
   - Banco de dados: PostgreSQL do Railway
   - Sistema roda 24/7 para clientes

---

## 🔧 CORRIGIR O FRONTEND (VOLTAR AO DUAL)

O problema é que eu mudei o `frontend/src/services/api.js` para apontar **direto pro Railway**.

**Solução**: Vamos usar **variáveis de ambiente** para o frontend detectar automaticamente:

```javascript
// frontend/src/services/api.js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
});
```

**Como funciona**:
- Se você rodar localmente (`npm run dev`): usa `localhost:8080`
- Se você fizer build (`npm run build`): usa a URL do Railway

---

## 📝 PRÓXIMOS PASSOS

### **AGORA (URGENTE)**:
1. Vá no Railway → Query
2. Execute o SQL do PASSO 4 acima
3. Tente fazer login novamente

### **DEPOIS (AMBIENTE DUAL)**:
1. Vou corrigir o `api.js` para voltar ao dual
2. Você volta a testar localmente
3. Só sobe pra Railway quando estiver tudo certo

---

**Execute o SQL no Railway e me avise se conseguiu logar!**
