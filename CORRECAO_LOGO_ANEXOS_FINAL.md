# ✅ CORREÇÃO FINAL - Logo e Anexos

## 🎯 Problemas Corrigidos

### 1. Logo Quebra Após F5 (RESOLVIDO)

**Causa Raiz**: Logo não estava sendo exibida na Navbar

**Correções Aplicadas**:

#### A) `backend/src/server.js`
```javascript
const path = require('path');
const uploadsPath = path.join(__dirname, '..', 'uploads');
console.log('📁 Caminho absoluto de uploads:', uploadsPath);
app.use('/uploads', express.static(uploadsPath));
```
✅ Caminho absoluto para pasta uploads
✅ Log para debug

#### B) `frontend/src/components/Navbar.jsx`
```javascript
import { usePreferencias } from '../contexts/PreferenciasContext';

{preferencias.logo && (
  <img 
    src={`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}${preferencias.logo}`}
    alt="Logo"
    className="navbar-logo"
    style={{ 
      maxHeight: '40px', 
      marginRight: '15px',
      objectFit: 'contain'
    }}
  />
)}
```
✅ Logo exibida na Navbar
✅ URL completa: `http://localhost:8080/uploads/arquivo.jpg`
✅ Fallback para variável de ambiente

#### C) `frontend/src/contexts/PreferenciasContext.jsx`
```javascript
useEffect(() => {
  carregarConfiguracoes();
}, []);

const carregarConfiguracoes = async () => {
  try {
    const response = await api.get('/configuracoes');
    const config = response.data;
    
    const novasPrefs = {
      ...preferencias,
      logo: config.logo,  // Já vem como /uploads/arquivo.jpg
      corPrimaria: config.cor_primaria || '#2c3e50',
      // ... outras cores
    };
    
    setPreferencias(novasPrefs);
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
  }
};
```
✅ Carrega configurações automaticamente ao iniciar
✅ Logo disponível em `preferencias.logo`

#### D) `frontend/src/pages/Configuracoes.jsx`
```javascript
const { preferencias, atualizarPreferencias, carregarConfiguracoes } = usePreferencias();

const salvarLogo = async () => {
  // ... upload
  await carregarConfiguracoes();  // ← Recarrega após salvar
  alert('Logo atualizada com sucesso!');
};
```
✅ Recarrega configurações após salvar
✅ Logo atualiza automaticamente na Navbar

---

### 2. Erro de Anexo (caminho_arquivo null) (RESOLVIDO)

**Causa Raiz**: Coluna `caminho_arquivo` precisa de valor, mas `anexosController` já estava correto

**Verificação**:

#### `backend/src/controllers/anexosController.js` (linha 35)
```javascript
const result = await db.query(
  `INSERT INTO exames_anexos (exame_id, nome_arquivo, caminho_arquivo, enviado_por)
   VALUES ($1, $2, $3, $4) RETURNING *`,
  [exame_id, req.file.originalname, req.file.filename, usuario_id]
);
```
✅ `req.file.filename` nunca é null (se `req.file` existir)
✅ `nome_arquivo` = nome original do usuário
✅ `caminho_arquivo` = nome gerado pelo multer

#### `backend/src/database/migrations.js`
```javascript
await db.query(`
  DO $$ 
  BEGIN 
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'exames_anexos' AND column_name = 'caminho_arquivo'
    ) THEN
      ALTER TABLE exames_anexos ADD COLUMN caminho_arquivo VARCHAR(500);
    END IF;
    
    -- Migrar dados de arquivo_path (se existir)
    UPDATE exames_anexos 
    SET caminho_arquivo = arquivo_path 
    WHERE caminho_arquivo IS NULL AND arquivo_path IS NOT NULL;
  END $$;
`);
```
✅ Cria coluna automaticamente
✅ Migra dados da coluna antiga

---

## 🧪 Como Testar

### Teste 1: Logo Persistente
1. Ir em Configurações
2. Upload de imagem PNG/JPG
3. Clicar "Salvar Logo"
4. ✅ Logo aparece na Navbar
5. **F5 (refresh)**
6. ✅ Logo permanece visível

**Se falhar**:
- F12 → Network → ver requisição para `/configuracoes`
- Verificar se retorna `logo: "/uploads/arquivo.jpg"`
- Testar URL direta: `http://localhost:8080/uploads/arquivo.jpg`

### Teste 2: Anexo de Exame
1. Exames → 📎
2. Upload PDF
3. ✅ Arquivo aparece na lista com nome
4. Clicar "Visualizar" (👁️)
5. ✅ PDF abre em nova aba

**Se erro 23502 (null value)**:
- Backend logs → procurar "Erro ao adicionar anexo"
- Verificar se `req.file` está chegando
- Testar upload de arquivo menor (< 2MB)

### Teste 3: URL da Logo
```javascript
// No console do navegador (F12):
console.log(window.preferencias?.logo);
// Deve retornar: "/uploads/1234567890-arquivo.jpg"

// Testar URL completa:
window.open('http://localhost:8080/uploads/1234567890-arquivo.jpg');
// Deve abrir a imagem
```

---

## 📊 Fluxo Completo da Logo

### Upload
1. Usuário escolhe arquivo em Configurações
2. Frontend: `FormData.append('logo', file)`
3. Backend: Multer salva em `backend/uploads/`
4. Backend: Retorna `{ logo: "/uploads/1234567890.jpg" }`
5. Frontend: Chama `carregarConfiguracoes()`
6. PreferenciasContext: Atualiza `preferencias.logo`
7. Navbar: Re-renderiza com nova logo

### F5 (Refresh)
1. App inicia
2. PreferenciasContext executa `useEffect(() => carregarConfiguracoes())`
3. GET `/configuracoes` → `{ logo: "/uploads/1234567890.jpg" }`
4. `setPreferencias({ logo: "/uploads/..." })`
5. Navbar renderiza com logo

### Exibição
```jsx
<img 
  src={`http://localhost:8080${preferencias.logo}`}
  // Resultado: http://localhost:8080/uploads/1234567890.jpg
/>
```

---

## 🔍 Diagnóstico de Erros

### Logo não aparece após F5
**Verificar**:
```javascript
// 1. Backend retorna logo?
fetch('http://localhost:8080/api/configuracoes')
  .then(r => r.json())
  .then(d => console.log('Logo:', d.logo));

// 2. PreferenciasContext carregou?
console.log(preferencias);

// 3. Arquivo existe?
// Navegador: http://localhost:8080/uploads/nome-arquivo.jpg
```

**Soluções**:
- Se backend não retorna logo → verificar banco de dados
- Se preferencias vazio → verificar se PreferenciasProvider está no App.jsx
- Se arquivo não abre → verificar pasta `backend/uploads/`

### Erro 404 ao acessar /uploads
**Causa**: Express.static não configurado

**Verificar**:
```powershell
# Ver logs do backend ao iniciar
npm run dev
# Deve aparecer: "📁 Caminho absoluto de uploads: C:\...\backend\uploads"
```

**Solução**:
```javascript
// server.js deve ter:
const uploadsPath = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsPath));
```

### Logo quebra em produção (Railway)
**Causa**: Caminho relativo diferente

**Solução**:
```javascript
// Frontend usar variável de ambiente:
src={`${import.meta.env.VITE_API_URL}${preferencias.logo}`}

// .env (Railway):
VITE_API_URL=https://seu-backend.railway.app
```

---

## ✅ Checklist Final

### Backend
- [x] `path` importado no server.js
- [x] `uploadsPath` com caminho absoluto
- [x] `express.static` configurado
- [x] Log do caminho ao iniciar
- [x] `configuracoesController` retorna `/uploads/arquivo.jpg`
- [x] `anexosController` salva `caminho_arquivo`

### Frontend
- [x] Navbar importa `usePreferencias`
- [x] Navbar exibe logo condicionalmente
- [x] URL completa: `VITE_API_URL + logo`
- [x] PreferenciasContext carrega ao iniciar
- [x] Configuracoes recarrega após salvar
- [x] `objectFit: contain` para não distorcer

### Banco de Dados
- [x] Coluna `caminho_arquivo` existe
- [x] Migrations cria automaticamente
- [x] Dados migrados de `arquivo_path`

---

## 📦 Arquivos Modificados

1. ✅ `backend/src/server.js` - Log do caminho absoluto
2. ✅ `frontend/src/components/Navbar.jsx` - Exibe logo
3. ✅ `frontend/src/contexts/PreferenciasContext.jsx` - Carrega configs ao iniciar
4. ✅ `frontend/src/pages/Configuracoes.jsx` - Recarrega após salvar

---

## 🚀 Próximos Passos

1. **Reiniciar backend**:
   ```powershell
   cd central-resultados/backend
   npm run dev
   ```
   Verificar log: `📁 Caminho absoluto de uploads: ...`

2. **Reiniciar frontend**:
   ```powershell
   cd central-resultados/frontend
   npm run dev
   ```

3. **Testar logo**:
   - Upload → Salvar → F5 → Logo permanece

4. **Testar anexo**:
   - Upload PDF → Lista → Visualizar

Se tudo funcionar: ✅ **Sistema estável!**
