const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage do Cloudinary com nome customizado (Nome_CPF)
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    // Extrair nome e CPF do corpo da requisição
    const nome = req.body.funcionario_nome || 'SemNome';
    const cpf = req.body.funcionario_cpf || 'SemCPF';
    
    // Limpar caracteres especiais
    const nomeLimpo = nome.replace(/[^a-zA-Z0-9]/g, '_');
    const cpfLimpo = cpf.replace(/[^0-9]/g, '');
    
    // Nome final: NomeColaborador_CPF
    const nomeArquivo = `${nomeLimpo}_${cpfLimpo}`;
    
    console.log(`📂 Upload Cloudinary - Nome: ${nomeArquivo}`);
    
    return {
      folder: 'central-resultados',
      allowed_formats: ['pdf', 'jpg', 'png', 'jpeg'],
      resource_type: 'auto',
      public_id: nomeArquivo
    };
  }
});

// Storage local (fallback)
const localStorage = require('./upload');

// Usar Cloudinary se configurado, senão usar storage local
const storage = process.env.CLOUDINARY_CLOUD_NAME ? cloudinaryStorage : localStorage.storage;

// Log da configuração
if (process.env.CLOUDINARY_CLOUD_NAME) {
  console.log('☁️  Cloudinary configurado! Uploads irão para a nuvem.');
  console.log('   Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
} else {
  console.log('⚠️  Cloudinary NÃO configurado. Usando storage local (efêmero).');
}

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

module.exports = upload;
