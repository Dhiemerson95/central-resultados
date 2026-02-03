const express = require('express');
const {
  listarExames,
  obterExame,
  criarExame,
  atualizarExame,
  deletarExame,
  enviarExamePorEmail,
  marcarComoLancadoSOC
} = require('../controllers/examesController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.use(authMiddleware);

router.get('/', listarExames);
router.get('/:id', obterExame);
router.post('/', upload.single('arquivo'), criarExame);
router.put('/:id', upload.single('arquivo'), atualizarExame);
router.delete('/:id', deletarExame);
router.post('/:id/enviar-email', enviarExamePorEmail);
router.put('/:id/lancar-soc', marcarComoLancadoSOC);

module.exports = router;
