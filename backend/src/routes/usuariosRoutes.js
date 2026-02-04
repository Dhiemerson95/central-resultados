const express = require('express');
const {
  listarUsuarios,
  obterUsuario,
  atualizarUsuario,
  deletarUsuario,
  resetarSenhaUsuario
} = require('../controllers/usuariosController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);

router.get('/', listarUsuarios);
router.get('/:id', obterUsuario);
router.put('/:id', atualizarUsuario);
router.delete('/:id', deletarUsuario);
router.post('/:id/resetar-senha', resetarSenhaUsuario);

module.exports = router;
