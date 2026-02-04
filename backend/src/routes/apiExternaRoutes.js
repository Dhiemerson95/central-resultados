const express = require('express');
const upload = require('../middleware/upload');
const { receberLaudo } = require('../controllers/apiExternaController');

const router = express.Router();

router.post('/receber-laudo', upload.single('arquivo'), receberLaudo);

module.exports = router;
