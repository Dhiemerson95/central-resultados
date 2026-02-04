const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
  listarPermissoes,
  listarPerfis,
  criarPerfil,
  atualizarPerfil,
  obterPermissoesUsuario,
  atualizarPermissoesUsuario
} = require('../controllers/permissoesController');

const router = express.Router();

router.use(authMiddleware);

router.get('/permissoes', listarPermissoes);
router.get('/perfis', listarPerfis);
router.post('/perfis', criarPerfil);
router.put('/perfis/:id', atualizarPerfil);
router.get('/usuarios/:usuario_id/permissoes', obterPermissoesUsuario);
router.put('/usuarios/:usuario_id/permissoes', atualizarPermissoesUsuario);

module.exports = router;
