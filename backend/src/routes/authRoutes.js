const express = require('express');
const { login, criarUsuario, resetarSenhaEmergencial, trocarSenhaPropria } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.post('/login', login);
router.post('/usuarios', criarUsuario);

// Troca de senha própria (usuário logado)
router.put('/trocar-senha', authMiddleware, trocarSenhaPropria);

// ROTA TEMPORÁRIA EMERGENCIAL - REMOVER APÓS RESOLVER
router.post('/reset-senha-emergencial', resetarSenhaEmergencial);

module.exports = router;
