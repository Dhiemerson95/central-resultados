const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
  exportarExames,
  exportarEmpresas,
  exportarClinicas
} = require('../controllers/exportacaoController');

const router = express.Router();

router.use(authMiddleware);

router.get('/exames', exportarExames);
router.get('/empresas', exportarEmpresas);
router.get('/clinicas', exportarClinicas);

module.exports = router;
