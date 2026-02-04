const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { executarMigrations } = require('./database/migrations');

const authRoutes = require('./routes/authRoutes');
const examesRoutes = require('./routes/examesRoutes');
const empresasRoutes = require('./routes/empresasRoutes');
const clinicasRoutes = require('./routes/clinicasRoutes');
const emailRoutes = require('./routes/emailRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const configuracoesRoutes = require('./routes/configuracoesRoutes');
const permissoesRoutes = require('./routes/permissoesRoutes');
const anexosRoutes = require('./routes/anexosRoutes');
const apiExternaRoutes = require('./routes/apiExternaRoutes');
const exportacaoRoutes = require('./routes/exportacaoRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080',
    'https://resultados.astassessoria.com.br'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsPath = path.join(__dirname, '..', 'uploads');
console.log('📁 Caminho absoluto de uploads:', uploadsPath);
app.use('/uploads', express.static(uploadsPath));

app.use('/api/auth', authRoutes);
app.use('/api/exames', examesRoutes);
app.use('/api/empresas', empresasRoutes);
app.use('/api/clinicas', clinicasRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/configuracoes', configuracoesRoutes);
app.use('/api/permissoes', permissoesRoutes);
app.use('/api/anexos', anexosRoutes);
app.use('/api/externa', apiExternaRoutes);
app.use('/api/exportar', exportacaoRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

const iniciarServidor = async () => {
  try {
    console.log('🚀 Iniciando servidor...');
    
    const resultadoMigrations = await executarMigrations();
    
    if (!resultadoMigrations.sucesso) {
      console.warn('⚠️  Migrations falharam, mas o servidor continuará:', resultadoMigrations.erro);
    }

    app.listen(PORT, () => {
      console.log(`✅ Servidor rodando na porta ${PORT}`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 CORS habilitado para: https://resultados.astassessoria.com.br`);
    });
  } catch (error) {
    console.error('❌ Erro crítico ao iniciar servidor:', error);
    process.exit(1);
  }
};

iniciarServidor();

module.exports = app;
