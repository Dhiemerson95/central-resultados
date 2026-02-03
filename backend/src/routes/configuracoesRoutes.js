const express = require('express');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();
const path = require('path');
const fs = require('fs');

router.use(authMiddleware);

router.post('/logo', upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const logoPath = `/uploads/${req.file.filename}`;

    res.json({ 
      sucesso: true, 
      logo: `http://localhost:5000${logoPath}`,
      mensagem: 'Logo atualizada com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao salvar logo:', error);
    res.status(500).json({ error: 'Erro ao salvar logo' });
  }
});

module.exports = router;
