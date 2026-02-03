const express = require('express');
const {
  listarEmpresas,
  obterEmpresa,
  criarEmpresa,
  atualizarEmpresa,
  deletarEmpresa
} = require('../controllers/empresasController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);

router.get('/', listarEmpresas);
router.get('/:id', obterEmpresa);
router.post('/', criarEmpresa);
router.put('/:id', atualizarEmpresa);
router.delete('/:id', deletarEmpresa);

module.exports = router;
