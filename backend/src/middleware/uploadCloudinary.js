const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage do Cloudinary
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'central-resultados',
    allowed_formats: ['pdf', 'jpg', 'png', 'jpeg'],
    resource_type: 'auto'
  }
});

// Storage local (fallback)
const localStorage = require('./upload');

// Usar Cloudinary se configurado, senão usar storage local
const storage = process.env.CLOUDINARY_CLOUD_NAME ? cloudinaryStorage : localStorage.storage;

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

module.exports = upload;
