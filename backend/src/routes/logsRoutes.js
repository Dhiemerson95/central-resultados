const express = require('express');
const authMiddleware = require('../middleware/auth');
const { listarLogs } = require('../controllers/logsController');

const router = express.Router();

router.use(authMiddleware);

router.get('/', listarLogs);

module.exports = router;
