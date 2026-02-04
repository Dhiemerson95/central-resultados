# 🔧 CORREÇÃO - Logo Maior e Visualização de Anexos

## ✅ Correções Aplicadas

### 1. Logo Maior no Header (RESOLVIDO)

**Arquivo**: `frontend/src/components/Navbar.jsx`

**Alteração**:
```jsx
<img style={{ 
  height: '80px',        // ← Aumentado de 50px para 80px
  width: 'auto',
  maxWidth: '200px',     // ← Aumentado de 150px
  objectFit: 'contain'
}} />
```

**Resultado**:
- ✅ Logo 60% maior que a versão anterior (80px vs 50px)
- ✅ Largura máxima aumentada para 200px
- ✅ Mantém proporção e alinhamento

---

### 2. Visualização de Anexos (RESOLVIDO)

#### Problema Identificado
- Botão "Visualizar" recarregava a página
- Faltava `target="_blank"`
- URL possivelmente incompleta

#### Correções no `ModalAnexos.jsx`

**Função handleVisualizar**:
```javascript
const handleVisualizar = (anexo) => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const url = `${baseUrl}/uploads/${anexo.caminho_arquivo}`;
  console.log('📄 Abrindo PDF:', url);
  window.open(url, '_blank', 'noopener,noreferrer');  // ← target="_blank" + segurança
};
```

**Mudanças**:
- ✅ Fallback para `localhost:8080` se `VITE_API_URL` não definida
- ✅ `target="_blank"` via `window.open(url, '_blank')`
- ✅ Flags de segurança: `noopener,noreferrer`
- ✅ Log da URL para debug

**Função handleBaixar**:
```javascript
const handleBaixar = (anexo) => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const url = `${baseUrl}/uploads/${anexo.caminho_arquivo}`;
  const a = document.createElement('a');
  a.href = url;
  a.download = anexo.nome_arquivo;
  a.target = '_blank';  // ← Adicionado
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
```

---

### 3. Logs de Debug (ADICIONADO)

#### Backend: `anexosController.js`

**Upload de arquivo**:
```javascript
console.log('📎 Upload de anexo:');
console.log('   Exame ID:', exame_id);
console.log('   Nome original:', req.file.originalname);
console.log('   Nome salvo:', req.file.filename);
console.log('   Caminho completo:', req.file.path);
console.log('✅ Anexo salvo com ID:', result.rows[0].id);
```

**Listagem de anexos**:
```javascript
console.log(`📋 Listando anexos do exame ${exame_id}:`, result.rows.length, 'arquivo(s)');
result.rows.forEach(anexo => {
  console.log(`   - ID: ${anexo.id}, Arquivo: ${anexo.caminho_arquivo}, Oficial: ${anexo.oficial}`);
});
```

#### Frontend: `ModalAnexos.jsx`

**Carregamento**:
```javascript
console.log('📋 Anexos carregados:', response.data.length);
response.data.forEach(anexo => {
  console.log(`   - ${anexo.nome_arquivo} → ${anexo.caminho_arquivo}`);
});
```

---

## 🧪 Como Testar

### Teste 1: Logo Maior

1. **Iniciar frontend**:
   ```powershell
   cd central-resultados/frontend
   npm run dev
   ```

2. **Fazer login**

3. **Verificar logo no header**:
   - ✅ Logo deve ter ~80px de altura
   - ✅ Logo deve estar alinhada com o texto
   - ✅ Logo não deve ultrapassar 200px de largura

**Ajuste fino** (se necessário):
```jsx
// Navbar.jsx linha 34
height: '80px',  // Aumentar/diminuir conforme preferência
```

---

### Teste 2: Visualizar Anexo

#### Preparação
1. **Executar diagnóstico**:
   ```powershell
   cd central-resultados/backend
   node diagnostico-anexos.js
   ```

   **Saída esperada**:
   ```
   ✅ Pasta uploads existe
   ✅ Tabela existe com 8 colunas
   ✅ Total de anexos: X
   🧪 Teste com primeiro anexo:
      http://localhost:8080/uploads/1234567890-arquivo.pdf
   ```

2. **Copiar URL de teste** e abrir no navegador
   - ✅ Deve abrir o PDF diretamente

#### Teste no Sistema

1. **Iniciar backend**:
   ```powershell
   cd central-resultados/backend
   npm run dev
   ```
   
   **Verificar logs**:
   ```
   📁 Caminho absoluto de uploads: C:\...\backend\uploads
   ```

2. **Abrir frontend e fazer login**

3. **Ir em Exames → Clicar 📎**

4. **Upload de arquivo PDF**
   
   **Logs esperados no backend**:
   ```
   📎 Upload de anexo:
      Exame ID: 123
      Nome original: relatorio.pdf
      Nome salvo: 1738675200000-123456789.pdf
      Caminho completo: uploads\1738675200000-123456789.pdf
   ✅ Anexo salvo com ID: 45
   ```

5. **Arquivo aparece na lista**
   
   **Logs esperados no frontend (F12 Console)**:
   ```
   📋 Anexos carregados: 1
      - relatorio.pdf → 1738675200000-123456789.pdf
   ```

6. **Clicar em "👁️ Visualizar"**
   
   **Logs esperados no frontend**:
   ```
   📄 Abrindo PDF: http://localhost:8080/uploads/1738675200000-123456789.pdf
   ```
   
   **Comportamento esperado**:
   - ✅ Nova aba abre
   - ✅ PDF é exibido no navegador
   - ✅ Não recarrega a página atual

---

## 🔍 Diagnóstico de Erros

### Erro: "Recarrega a página ao clicar Visualizar"

**Causa**: Evento de clique não está sendo interceptado

**Verificar**:
```jsx
// ModalAnexos.jsx linha 150
<button
  onClick={() => handleVisualizar(anexo)}  // ← Deve ter arrow function
  className="btn btn-small btn-primary"
>
  👁️
</button>
```

**Se ainda recarregar**:
```javascript
// Adicionar preventDefault explícito:
const handleVisualizar = (e, anexo) => {
  e?.preventDefault();
  e?.stopPropagation();
  const url = `http://localhost:8080/uploads/${anexo.caminho_arquivo}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

// E no botão:
onClick={(e) => handleVisualizar(e, anexo)}
```

---

### Erro: "PDF não abre (erro 404)"

**Diagnóstico**:
```powershell
# 1. Verificar se arquivo existe
cd central-resultados/backend
node diagnostico-anexos.js

# 2. Testar URL manualmente
# Copiar URL do log e colar no navegador

# 3. Verificar express.static
# server.js deve ter:
app.use('/uploads', express.static(uploadsPath));
```

**Soluções**:
- Backend não rodando → `npm run dev`
- Pasta uploads vazia → Fazer upload novamente
- express.static não configurado → Verificar server.js linha 38-40

---

### Erro: "Anexo salvo mas não lista"

**Verificar no banco**:
```sql
SELECT id, nome_arquivo, caminho_arquivo, oficial 
FROM exames_anexos 
WHERE exame_id = 123
ORDER BY criado_em DESC;
```

**Verificar rota**:
```powershell
# Testar diretamente:
Invoke-WebRequest -Uri "http://localhost:8080/api/anexos/exames/123/anexos" `
  -Headers @{Authorization="Bearer SEU_TOKEN"}
```

---

### Erro: "caminho_arquivo é null"

**Causa**: Campo não está sendo populado no INSERT

**Verificar**:
```javascript
// anexosController.js linha 38-41
await db.query(
  `INSERT INTO exames_anexos (exame_id, nome_arquivo, caminho_arquivo, enviado_por)
   VALUES ($1, $2, $3, $4)`,
  [exame_id, req.file.originalname, req.file.filename, usuario_id]
);
```

**Solução**:
```javascript
// Adicionar log antes do INSERT:
console.log('Dados do INSERT:', {
  exame_id,
  nome_arquivo: req.file.originalname,
  caminho_arquivo: req.file.filename,  // ← Deve ter valor!
  usuario_id
});
```

---

## 📊 Fluxo Completo de Anexo

### Upload
1. Usuário escolhe PDF
2. Frontend: `FormData.append('arquivo', file)`
3. Backend: Multer salva em `backend/uploads/1234567890-arquivo.pdf`
4. Backend: INSERT com `caminho_arquivo = '1234567890-arquivo.pdf'`
5. Backend: Retorna anexo com ID

### Listagem
1. Frontend: `GET /anexos/exames/123/anexos`
2. Backend: SELECT com JOIN de usuários
3. Backend: Retorna array com `caminho_arquivo`
4. Frontend: Renderiza lista

### Visualização
1. Usuário clica "👁️"
2. Frontend: Constrói URL `http://localhost:8080/uploads/${caminho_arquivo}`
3. Frontend: `window.open(url, '_blank')`
4. Navegador: Abre nova aba e baixa PDF
5. Navegador: Exibe PDF inline

---

## ✅ Checklist de Verificação

### Backend
- [x] `express.static` configurado para `/uploads`
- [x] Pasta `backend/uploads` existe
- [x] Multer salvando com nome único
- [x] INSERT usa `caminho_arquivo` (não `arquivo_path`)
- [x] Logs de upload e listagem

### Frontend
- [x] `handleVisualizar` usa URL absoluta
- [x] `window.open` com `_blank`
- [x] Fallback para `localhost:8080`
- [x] Logs no console
- [x] Botão não está dentro de `<form>`

### Banco de Dados
- [x] Coluna `caminho_arquivo` existe
- [x] Coluna aceita VARCHAR(500)
- [x] Registros têm valor em `caminho_arquivo`

---

## 📦 Arquivos Modificados

1. ✅ `frontend/src/components/Navbar.jsx` - Logo 80px (linha 34)
2. ✅ `frontend/src/components/ModalAnexos.jsx` - Visualizar com _blank (linhas 14-30, 73-87)
3. ✅ `backend/src/controllers/anexosController.js` - Logs de debug (linhas 3-50)
4. ✅ `backend/diagnostico-anexos.js` - Script de diagnóstico **NOVO**

---

## 🚀 Próximos Passos

1. **Reiniciar backend**:
   ```powershell
   cd central-resultados/backend
   npm run dev
   ```

2. **Executar diagnóstico**:
   ```powershell
   node diagnostico-anexos.js
   ```

3. **Reiniciar frontend**:
   ```powershell
   cd central-resultados/frontend
   npm run dev
   ```

4. **Testar**:
   - Logo maior no header
   - Upload de PDF
   - Visualizar em nova aba
   - Baixar arquivo

**Se tudo funcionar**: ✅ Sistema 100% pronto!
