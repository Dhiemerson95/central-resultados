const express = require('express');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/uploadCloudinary');
const {
  listarAnexosExame,
  adicionarAnexoExame,
  marcarAnexoOficial,
  desmarcarAnexoOficial,
  deletarAnexoExame,
  liberarExameParaCliente,
  listarExamesPendentesRevisao
} = require('../controllers/anexosController');

const router = express.Router();

router.use(authMiddleware);

router.get('/exames/:exame_id/anexos', listarAnexosExame);
router.post('/exames/:exame_id/anexos', upload.single('arquivo'), adicionarAnexoExame);
router.put('/anexos/:anexo_id/oficial', marcarAnexoOficial);
router.delete('/anexos/:anexo_id/oficial', desmarcarAnexoOficial);
router.delete('/anexos/:anexo_id', deletarAnexoExame);
router.post('/exames/:exame_id/liberar', liberarExameParaCliente);
router.get('/exames/pendentes-revisao', listarExamesPendentesRevisao);

module.exports = router;
