# 📁 LOCALIZAÇÃO DOS ARQUIVOS UPLOAD

## Estrutura de Armazenamento

### 📂 Diretório Principal: `backend/uploads/`

Todos os arquivos enviados (PDFs de laudos, imagens de logos) são armazenados na pasta `uploads` do backend.

```
central-resultados/
├── backend/
│   ├── uploads/              ← PASTA PRINCIPAL DE UPLOADS
│   │   ├── logo-empresa.png  ← Logos das empresas
│   │   ├── laudo-123.pdf     ← PDFs de laudos
│   │   ├── laudo-456.pdf
│   │   └── ...
│   ├── src/
│   └── package.json
└── frontend/
```

---

## 🖼️ Logos

**Onde ficam:**
- Pasta: `backend/uploads/`
- Formatos aceitos: PNG, JPG, JPEG
- Tamanho máximo: 2MB

**Como são salvos:**
- Nome do arquivo é preservado ou renomeado com timestamp
- Exemplo: `logo_1738667890123.png`

**Como acessar:**
```javascript
// No frontend
const logoUrl = `${API_URL}/uploads/nome-do-arquivo.png`;

// No navegador
https://seu-backend.com/uploads/nome-do-arquivo.png
```

---

## 📄 PDFs de Laudos

**Onde ficam:**
- Pasta: `backend/uploads/`
- Formatos aceitos: PDF
- Tamanho máximo: 10MB (configurável)

**Tipos de upload:**
1. **Manual** - Administrador faz upload direto no formulário de exames
2. **API Externa** - Outros sistemas enviam laudos via API

**Como são salvos:**
```
backend/uploads/laudo_exame_456_1738667890.pdf
```

**Estrutura de nome:**
- `laudo_` - Prefixo
- `exame_456` - ID do exame
- `_1738667890` - Timestamp
- `.pdf` - Extensão

---

## 🌐 Como os Arquivos São Servidos

### No Server.js:

```javascript
// Rota estática para servir arquivos de upload
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```

Isso permite acessar qualquer arquivo via:
```
https://seu-backend.railway.app/uploads/arquivo.pdf
```

---

## 📤 Upload via API Externa

Outros sistemas podem enviar laudos através da rota:

```http
POST https://seu-backend/api/externa/receber-laudo
Content-Type: multipart/form-data

Headers:
- api_key: sua-chave-aqui

Body (FormData):
- clinica_id: 1
- empresa_id: 5
- funcionario_nome: "João Silva"
- funcionario_cpf: "12345678900"
- data_atendimento: "2024-02-04"
- tipo_exame: "ASO Admissional"
- resultado: "Apto"
- arquivo: (PDF file)
```

**Resposta de sucesso:**
```json
{
  "sucesso": true,
  "mensagem": "Laudo recebido com sucesso",
  "exame_id": 789
}
```

O arquivo será salvo em: `backend/uploads/laudo_exame_789_xxx.pdf`

---

## 🔒 Segurança

### Validações Implementadas:

1. **Tipo de Arquivo:**
   - Logos: apenas PNG, JPG, JPEG
   - Laudos: apenas PDF

2. **Tamanho:**
   - Logos: máximo 2MB
   - Laudos: máximo 10MB

3. **Nome do Arquivo:**
   - Sanitizado para evitar path traversal
   - Timestamp adicionado para evitar sobrescrita

### Configuração no Middleware:

```javascript
// backend/src/middleware/upload.js
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const nome = file.originalname.replace(/\s+/g, '_');
    cb(null, `${timestamp}_${nome}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const tiposPermitidos = /pdf|png|jpg|jpeg/;
    const extname = tiposPermitidos.test(file.mimetype);
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Tipo de arquivo não permitido'));
  }
});
```

---

## 🚀 Deploy no Railway

**IMPORTANTE:** No Railway, a pasta `uploads` é temporária!

### Solução Recomendada:

Para produção, considere usar um serviço de armazenamento externo:

1. **AWS S3** - Armazenamento em nuvem da Amazon
2. **Cloudinary** - Específico para imagens
3. **Google Cloud Storage**
4. **Azure Blob Storage**

### Por que?

O Railway pode **resetar a pasta uploads** ao fazer novo deploy ou reiniciar o container.

### Migração para S3 (Exemplo):

```javascript
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'central-resultados-uploads',
    key: (req, file, cb) => {
      cb(null, `${Date.now()}_${file.originalname}`);
    }
  })
});
```

---

## 📊 Resumo

| Tipo | Localização | Acesso Via | Tamanho Máx |
|------|-------------|------------|-------------|
| Logos | `backend/uploads/` | `/uploads/logo.png` | 2MB |
| Laudos (Manual) | `backend/uploads/` | `/uploads/laudo.pdf` | 10MB |
| Laudos (API) | `backend/uploads/` | `/uploads/laudo.pdf` | 10MB |

**URL de Acesso:**
```
Local: http://localhost:8080/uploads/arquivo.pdf
Produção: https://seu-backend.railway.app/uploads/arquivo.pdf
```

---

## ⚠️ Atenção para Produção

1. **Backup Regular** - Faça backup da pasta uploads
2. **Armazenamento Externo** - Migre para S3 ou similar
3. **CDN** - Use CloudFront para servir arquivos mais rápido
4. **Limpeza** - Implemente rotina para deletar arquivos antigos

---

**Documentação criada em:** 04/02/2026
