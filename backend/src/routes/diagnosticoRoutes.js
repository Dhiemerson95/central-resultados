const express = require('express');
const router = express.Router();

router.get('/diagnostico', (req, res) => {
  const diagnostico = {
    ambiente: process.env.NODE_ENV || 'development',
    cloudinary: {
      configurado: !!process.env.CLOUDINARY_CLOUD_NAME,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'Configurado' : 'Não configurado',
      api_key: process.env.CLOUDINARY_API_KEY ? 'Configurado' : 'Não configurado',
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'Configurado' : 'Não configurado'
    },
    database: {
      url_configurada: !!process.env.DATABASE_URL,
      host: process.env.DB_HOST || 'Não configurado',
      port: process.env.DB_PORT || 'Não configurado',
      database: process.env.DB_NAME || 'Não configurado'
    },
    jwt: {
      secret_configurado: !!process.env.JWT_SECRET
    },
    cors: {
      origens_permitidas: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173',
        'https://resultados.astassessoria.com.br',
        'https://www.resultados.astassessoria.com.br',
        'https://central-resultados-production.up.railway.app'
      ]
    },
    servidor: {
      porta: process.env.PORT || 5000,
      timestamp: new Date().toISOString()
    }
  };

  console.log('🔍 Diagnóstico solicitado');
  console.log(JSON.stringify(diagnostico, null, 2));

  res.json(diagnostico);
});

module.exports = router;
