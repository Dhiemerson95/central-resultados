# 🚨 CORREÇÃO URGENTE: FRONTEND CHAMANDO LOCALHOST

## PROBLEMA IDENTIFICADO

O frontend em produção está chamando `http://localhost:5000` ao invés da URL do Railway.

**Erro no console**:
```
Mixed Content: The page at 'https://resultados.astassessoria.com.br/' 
was loaded over HTTPS, but requested an insecure element 
'http://localhost:5000/uploads/...'
```

**Consequências**:
- ❌ Uploads não vão para Cloudinary (vão para localhost)
- ❌ Logo não carrega (chama localhost)
- ❌ Login mobile não funciona (Mixed Content bloqueado)

---

## SOLUÇÃO IMEDIATA (RAILWAY)

### Passo 1: Configurar variável no Frontend Railway

1. **Railway** → Projeto **Frontend | Central de Resultados**
2. Clique na aba **"Variables"**
3. Clique em **"+ New Variable"**
4. Adicione:
   - **Nome**: `VITE_API_URL`
   - **Valor**: `https://central-resultados-production.up.railway.app/api`
5. **Salvar** (Railway reinicia automaticamente)

---

### Passo 2: Aguardar Rebuild (2-3 minutos)

O Railway vai fazer rebuild automático do frontend com a nova variável.

**Acompanhe**:
- Frontend → **Deployments** → Último deploy
- Aguarde aparecer "Build Successful" ou "Deployment Live"

---

### Passo 3: Testar novamente

**Após rebuild terminar**:

1. Acesse: `https://resultados.astassessoria.com.br`
2. **Ctrl + Shift + Delete** (limpar TUDO do cache)
3. Fazer login
4. **Abrir Console** (F12) → Aba "Console"
5. ✅ **NÃO deve ter** erro "Mixed Content"
6. ✅ **NÃO deve ter** menção a "localhost"

---

## TESTES APÓS CORREÇÃO

### Teste 1: Logo carrega corretamente
- Logo no canto superior esquerdo
- ✅ Deve carregar sem erro
- Console: Sem "Mixed Content"

---

### Teste 2: Upload vai para Cloudinary
1. Gestão de Anexos → Upload de PDF
2. Backend Logs → Deve mostrar:
   ```
   📎 Upload de anexo:
   Arquivo (req.file): {
     "path": "https://res.cloudinary.com/dmdmmphge/..."
   }
   ```
3. Cloudinary → Media Library → Pasta **central-resultados**
4. ✅ Arquivo deve aparecer

---

### Teste 3: Login Mobile funciona
1. Celular → `https://resultados.astassessoria.com.br`
2. Fazer login
3. ✅ Deve entrar normalmente (sem erro de CORS)

---

## VERIFICAÇÃO

### Console não deve ter:
- ❌ `localhost:5000`
- ❌ `Mixed Content`
- ❌ `Failed to fetch`

### Backend Logs devem ter:
- ✅ `☁️ Cloudinary configurado`
- ✅ `📎 Upload de anexo: path: "https://res.cloudinary.com/..."`

---

## OUTRAS CORREÇÕES PENDENTES

### 1. Fuso Horário (UTC → BRT)
**Problema**: Data/hora mostrando 3 horas a mais  
**Causa**: Backend salva em UTC, frontend não converte  
**Solução**: Próximo commit

### 2. Reset de Senha por Admin
**Problema**: Admin não pode resetar senha de usuários  
**Causa**: Funcionalidade não implementada  
**Solução**: Próximo commit (botão "Resetar Senha" na gestão de usuários)

---

## IMPORTANTE

**NÃO TESTE AINDA!**

Aguarde:
1. ✅ Adicionar `VITE_API_URL` no Railway Frontend
2. ✅ Rebuild terminar (2-3 min)
3. ✅ Limpar cache completo (Ctrl + Shift + Delete)

**Aí sim pode testar!**

---

## CHECKLIST

- [ ] Railway → Frontend → Variables → Adicionar `VITE_API_URL`
- [ ] Aguardar rebuild (Deployments → logs)
- [ ] Limpar cache completo do navegador
- [ ] Testar: Logo carrega sem erro
- [ ] Testar: Upload vai para Cloudinary
- [ ] Testar: Login mobile funciona
- [ ] Verificar: Console sem "localhost" ou "Mixed Content"

---

**ME AVISE QUANDO ADICIONAR A VARIÁVEL E O REBUILD TERMINAR!** 🚀
