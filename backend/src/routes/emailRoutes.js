const express = require('express');
const { testarConexao } = require('../services/emailService');
const { listarHistorico, reenviarEmail } = require('../controllers/emailController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);

router.get('/testar', async (req, res) => {
  try {
    const resultado = await testarConexao();
    
    if (resultado.sucesso) {
      res.json({ 
        sucesso: true, 
        mensagem: 'Conexão SMTP OK! O servidor de e-mail está configurado corretamente.' 
      });
    } else {
      res.status(500).json({ 
        sucesso: false, 
        erro: resultado.erro,
        codigo: resultado.codigo
      });
    }
  } catch (error) {
    res.status(500).json({ 
      sucesso: false, 
      erro: 'Erro ao testar conexão SMTP',
      detalhes: error.message
    });
  }
});

router.get('/historico', listarHistorico);
router.post('/reenviar/:id', reenviarEmail);

module.exports = router;
