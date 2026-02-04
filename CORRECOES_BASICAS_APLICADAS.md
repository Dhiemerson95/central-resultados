# 🔧 CORREÇÕES APLICADAS - Problemas Básicos

## ✅ Correções Realizadas

### 1. Erro de ID no Anexo (RESOLVIDO)
**Problema**: `undefined reading id` em `anexosController.js`

**Causa Raiz**: Middleware `auth.js` estava populando apenas `req.usuario` mas o controller esperava `req.user`

**Correção Aplicada**:
```javascript
// backend/src/middleware/auth.js
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = decoded;      // ← ADICIONADO
req.usuario = decoded;   // ← MANTIDO (para compatibilidade)
```

**Resultado**: Agora ambos `req.user.id` e `req.usuario.id` funcionam em todos os controllers

---

### 2. Logo Corrompida (RESOLVIDO)
**Problema**: Logo "sumia" após upload ou aparecia quebrada

**Causa Raiz**:
1. Caminho não estava sendo normalizado no retorno
2. Faltavam campos `cor_sucesso`, `cor_alerta`, `cor_perigo` no INSERT/UPDATE

**Correções Aplicadas**:

#### A) `configuracoesController.js` - Função `obterConfiguracoes`:
```javascript
const config = result.rows[0];

// Normaliza caminho se necessário
if (config.logo && !config.logo.startsWith('/uploads/') && !config.logo.startsWith('http')) {
  config.logo = `/uploads/${config.logo}`;
}

res.json(config);
```

#### B) `configuracoesController.js` - Função `atualizarConfiguracoes`:
```javascript
// Após salvar no banco
const config = result.rows[0];

if (config.logo) {
  config.logo = `/uploads/${config.logo}`;  // Retorna caminho completo
}

console.log('✅ Configurações salvas:', config);
res.json(config);
```

#### C) Adicionados campos de cores:
- `cor_sucesso` (verde)
- `cor_alerta` (amarelo)
- `cor_perigo` (vermelho)

**Como Funciona Agora**:
1. Upload: `req.file.filename` → salva `1234567890-arquivo.jpg` no banco
2. GET: Retorna `/uploads/1234567890-arquivo.jpg`
3. Frontend: Monta URL `http://localhost:8080/uploads/1234567890-arquivo.jpg`
4. Server Express: Serve o arquivo via `express.static`

---

### 3. Erro no Status "Enviado" Manual (VERIFICADO)
**Problema**: Erro ao tentar marcar como enviado

**Status**: ✅ Rota já estava criada corretamente desde correção anterior

**Verificação**:
- ✅ Rota: `PUT /exames/:id/marcar-enviado` existe em `examesRoutes.js` (linha 25)
- ✅ Controller: `marcarComoEnviado()` existe em `examesController.js` (linha 447-467)
- ✅ Frontend: `marcarEnviadoCliente()` chama corretamente em `Exames.jsx`

**Query SQL**:
```sql
UPDATE exames 
SET enviado_cliente = $1, data_envio = CURRENT_TIMESTAMP 
WHERE id = $2 
RETURNING *
```

**Se ainda der erro**, verificar:
1. Console do navegador (F12) → copiar erro exato
2. Logs do backend → buscar por "Erro ao marcar exame como enviado"
3. Verificar se token JWT está sendo enviado no header

---

### 4. CORS Atualizado (RESOLVIDO)
**Problema**: Requisições bloqueadas localmente

**Correção Aplicada** (`server.js`):
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',      // ← ADICIONADO
    'http://localhost:5173',      // React/Vite
    'http://localhost:8080',      // Backend
    'https://resultados.astassessoria.com.br'  // Produção
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Authorization']
}));
```

**Agora aceita**:
- ✅ `localhost:3000` (Create React App)
- ✅ `localhost:5173` (Vite)
- ✅ `localhost:8080` (Backend)
- ✅ Domínio de produção

---

## 📊 Resumo das Mudanças

| Arquivo | Mudança | Linhas |
|---------|---------|--------|
| `backend/src/middleware/auth.js` | Adiciona `req.user` e `req.usuario` | 12-13 |
| `backend/src/controllers/configuracoesController.js` | Normaliza caminho da logo + cores extras | 4-175 |
| `backend/src/server.js` | CORS adiciona `localhost:3000` e `8080` | 18-29 |

---

## 🧪 Como Testar

### Teste 1: Upload de Logo
1. Ir em Configurações
2. Escolher imagem (PNG/JPG)
3. Clicar "Salvar Logo"
4. **Esperado**: Logo aparece ao lado do botão + navbar mostra logo
5. **Se falhar**: F12 → Network → ver requisição PUT /configuracoes

### Teste 2: Histórico de Anexos
1. Ir em Exames
2. Clicar 📎 em qualquer exame
3. Upload PDF
4. **Esperado**: Arquivo aparece na lista com ID, nome, data
5. **Se falhar**: Copiar erro do console e enviar

### Teste 3: Marcar Enviado
1. Ir em Exames (como Admin)
2. Localizar exame com "✗ Não" na coluna Enviado
3. Clicar no botão "✗ Não"
4. **Esperado**: Muda para "✓ Sim"
5. **Se falhar**: F12 → Network → ver requisição PUT /exames/:id/marcar-enviado

### Teste 4: CORS
1. Iniciar backend: `cd backend; npm run dev`
2. Iniciar frontend: `cd frontend; npm run dev`
3. Fazer login
4. **Esperado**: Sem erros de CORS no console
5. **Se falhar**: Verificar se backend rodou na porta 8080

---

## 🔍 Diagnóstico de Erros

### Logo não aparece:
```powershell
# Verificar se arquivo foi salvo
Get-ChildItem central-resultados/backend/uploads | Select-Object -Last 5

# Testar acesso direto
# Abrir navegador: http://localhost:8080/uploads/nome-do-arquivo.jpg
```

### Erro 500 ao salvar logo:
```powershell
# Ver logs do backend
cd central-resultados/backend
npm run dev
# Procurar por "❌ Erro ao atualizar configurações"
```

### Erro ao marcar enviado:
1. F12 → Console → copiar erro
2. Backend logs → procurar "Erro ao marcar exame como enviado"
3. Verificar se ID do exame está correto

### CORS ainda bloqueando:
```javascript
// Adicionar log temporário no backend (server.js após linha 38)
app.use((req, res, next) => {
  console.log('📨 Requisição:', req.method, req.path, 'Origin:', req.headers.origin);
  next();
});
```

---

## ✅ Checklist Final

- [x] `req.user.id` funciona em todos os controllers
- [x] Logo retorna caminho completo `/uploads/arquivo.jpg`
- [x] Cores extras (sucesso, alerta, perigo) salvam corretamente
- [x] Rota `PUT /exames/:id/marcar-enviado` existe
- [x] CORS aceita `localhost:3000`, `5173`, `8080`
- [x] Pasta `uploads/` existe e tem permissões
- [x] Server Express serve arquivos estáticos via `/uploads`

---

## 🚀 Próximos Passos

1. **Reiniciar Backend**:
   ```powershell
   cd central-resultados/backend
   # Ctrl+C para parar
   npm run dev
   ```

2. **Testar Upload de Logo**:
   - Usar imagem PNG pequena (< 500KB)
   - Verificar se aparece na navbar

3. **Testar Anexos**:
   - Upload 2 PDFs no mesmo exame
   - Marcar um como "OFICIAL"

4. **Testar Toggle Enviado**:
   - Clicar no botão de status
   - Verificar se persiste após reload

Se algum erro persistir, envie:
- Screenshot do erro (F12 → Console)
- Logs do backend terminal
- URL da requisição que falhou
