const express = require('express');
const {
  listarClinicas,
  obterClinica,
  criarClinica,
  atualizarClinica,
  deletarClinica,
  sincronizarClinica,
  importarExames,
  listarLogs
} = require('../controllers/clinicasController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.use(authMiddleware);

router.get('/', listarClinicas);
router.get('/:id', obterClinica);
router.post('/', criarClinica);
router.put('/:id', atualizarClinica);
router.delete('/:id', deletarClinica);
router.post('/:id/sincronizar', sincronizarClinica);
router.post('/importar', upload.single('arquivo'), importarExames);
router.get('/logs/listar', listarLogs);

module.exports = router;
