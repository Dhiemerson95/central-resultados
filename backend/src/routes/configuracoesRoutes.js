const express = require('express');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  obterConfiguracoes,
  atualizarConfiguracoes,
  testarConexaoSMTP
} = require('../controllers/configuracoesController');
const router = express.Router();

router.use(authMiddleware);

router.get('/', obterConfiguracoes);
router.put('/', upload.single('logo'), atualizarConfiguracoes);
router.post('/testar-smtp', testarConexaoSMTP);

module.exports = router;
