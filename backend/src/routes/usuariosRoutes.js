const express = require('express');
const {
  listarUsuarios,
  obterUsuario,
  atualizarUsuario,
  deletarUsuario
} = require('../controllers/usuariosController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);

router.get('/', listarUsuarios);
router.get('/:id', obterUsuario);
router.put('/:id', atualizarUsuario);
router.delete('/:id', deletarUsuario);

module.exports = router;
