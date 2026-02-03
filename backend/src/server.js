const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const examesRoutes = require('./routes/examesRoutes');
const empresasRoutes = require('./routes/empresasRoutes');
const clinicasRoutes = require('./routes/clinicasRoutes');
const emailRoutes = require('./routes/emailRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const configuracoesRoutes = require('./routes/configuracoesRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/exames', examesRoutes);
app.use('/api/empresas', empresasRoutes);
app.use('/api/clinicas', clinicasRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/configuracoes', configuracoesRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
