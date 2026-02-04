const express = require('express');
const { login, criarUsuario, resetarSenhaEmergencial } = require('../controllers/authController');
const router = express.Router();

router.post('/login', login);
router.post('/usuarios', criarUsuario);

// ROTA TEMPORÁRIA EMERGENCIAL - REMOVER APÓS RESOLVER
router.post('/reset-senha-emergencial', resetarSenhaEmergencial);

module.exports = router;
