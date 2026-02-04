# 🚨 GUIA DE RESOLUÇÃO DE PROBLEMAS

## PROBLEMA 1: BOTÃO "TROCAR SENHA" NÃO APARECE

### Causa Provável:
Frontend do Railway não atualizou (build antigo)

### Solução Railway:
1. Acesse: https://railway.app/dashboard
2. Vá no projeto **Frontend | Central de Resultados**
3. Clique em **Settings**
4. Role até **Danger Zone**
5. Clique em **Redeploy**
6. Aguarde 2-3 minutos
7. Teste novamente (Ctrl + F5)

### Verificação:
Acesse: `https://resultados.astassessoria.com.br`  
Faça login → Botão **"🔑 Trocar Senha"** deve aparecer ao lado de "Sair"

---

## PROBLEMA 2: CLOUDINARY NÃO CONECTADO

### Diagnóstico:
Acesse esta URL no navegador:
```
https://central-resultados-production.up.railway.app/api/diagnostico
```

**Se aparecer**:
```json
{
  "cloudinary": {
    "configurado": false,
    "cloud_name": "Não configurado"
  }
}
```

**Significa**: Variáveis não foram carregadas

### Solução Railway:
1. Railway → **Backend** → **Variables**
2. Verifique se existem:
   - `CLOUDINARY_CLOUD_NAME` = `dmdmmphge`
   - `CLOUDINARY_API_KEY` = `259874742389524`
   - `CLOUDINARY_API_SECRET` = (o secret da chave Root)

3. **SE NÃO EXISTIREM**: Adicione-as
4. **SE JÁ EXISTIREM**: Clique em **Restart** (ícone de reiniciar)
5. Aguarde 1 minuto
6. Acesse novamente: `/api/diagnostico`

**Deve aparecer**:
```json
{
  "cloudinary": {
    "configurado": true,
    "cloud_name": "Configurado"
  }
}
```

---

## PROBLEMA 3: LOGIN MOBILE NÃO FUNCIONA

### Diagnóstico Mobile:
1. Celular → Navegador → `https://resultados.astassessoria.com.br`
2. Abrir **Console do Desenvolvedor** (se possível):
   - Android Chrome: Menu → Mais Ferramentas → Console
   - Safari iOS: Conectar no Mac → Safari → Develop

3. Tentar fazer login
4. Verificar mensagem de erro

### Verificação CORS:
Acesse: `https://central-resultados-production.up.railway.app/api/diagnostico`

```json
{
  "cors": {
    "origens_permitidas": [
      "https://resultados.astassessoria.com.br",
      ...
    ]
  }
}
```

### Verificação JWT:
```json
{
  "jwt": {
    "secret_configurado": true
  }
}
```

**Se `false`**: Adicione `JWT_SECRET` nas variáveis do Railway:
```
JWT_SECRET=chave-super-secreta-2024-ast-resultados
```

---

## PROBLEMA 4: CONEXÃO POSTGRESQL INSTÁVEL

### Sintoma:
```
could not receive data from client: Connection reset by peer
```

### Causa:
Railway free tier tem limites de conexões simultâneas

### Solução Temporária:
No arquivo `backend/src/database/db.js`, já está configurado:
- `max: 5` (máximo 5 conexões)
- `keepAlive: true`
- `idleTimeoutMillis: 30000`

### Solução Permanente:
1. Railway → PostgreSQL → **Settings**
2. Verificar plano (Free tem 100 conexões)
3. Se estiver excedendo, considerar upgrade

---

## PROBLEMA 5: TELA DE LOGS NÃO APARECE

### Causa:
Frontend não atualizou

### Solução:
**Mesma do Problema 1**: Redeploy do Frontend

### Verificação:
Após login como Admin/Operador:
- Menu superior deve ter: **"📊 Logs"** e **"📧 E-mails"**

---

## PROBLEMA 6: PERMISSÕES PARA LOGS

### Status:
✅ JÁ IMPLEMENTADO

- Admin/Operador: Vê tudo
- Cliente: **NÃO VÊ** logs nem histórico de e-mails

### Adicionar ao sistema de permissões granulares:
Será feito no próximo commit (sistema de permissões avançado)

---

## COMANDOS ÚTEIS

### Verificar se backend está online:
```
https://central-resultados-production.up.railway.app/api/health
```

**Deve retornar**:
```json
{
  "status": "ok",
  "timestamp": "2026-02-04T..."
}
```

### Diagnóstico completo:
```
https://central-resultados-production.up.railway.app/api/diagnostico
```

### Logs do Railway:
1. Railway → Backend → **Logs**
2. Procurar por:
   - `☁️ Cloudinary configurado`
   - `🔐 Tentativa de login`
   - `❌ Erro`

---

## CHECKLIST FINAL

Após corrigir tudo, verificar:

- [ ] `/api/diagnostico` → cloudinary.configurado = true
- [ ] `/api/diagnostico` → jwt.secret_configurado = true
- [ ] Frontend redesployado (botão Trocar Senha aparece)
- [ ] Login mobile funcionando
- [ ] Upload vai para Cloudinary (Media Library)
- [ ] Telas de Logs e E-mails aparecem no menu

---

## PRÓXIMOS PASSOS

1. **Sistema de Permissões Granulares**:
   - Checkboxes individuais para cada tela/função
   - Exemplo: "Pode ver logs", "Pode ver e-mails", "Pode exportar"

2. **Mobile-First CORS**:
   - Permitir TODAS as origens temporariamente
   - Log de origens bloqueadas para debug

3. **Cloudinary Webhook**:
   - Notificação quando upload completa
   - Confirmação visual no sistema

---

**Após seguir este guia, todos os problemas devem estar resolvidos!**
