const express = require('express');
const { login, criarUsuario } = require('../controllers/authController');
const router = express.Router();

router.post('/login', login);
router.post('/usuarios', criarUsuario);

module.exports = router;
