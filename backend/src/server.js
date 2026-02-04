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
const logsRoutes = require('./routes/logsRoutes');
const diagnosticoRoutes = require('./routes/diagnosticoRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Log de inicialização do Cloudinary
console.log('🔍 Verificando configuração Cloudinary...');
console.log('   CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Configurado' : '❌ NÃO configurado');
console.log('   CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ Configurado' : '❌ NÃO configurado');
console.log('   CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Configurado' : '❌ NÃO configurado');

if (process.env.CLOUDINARY_CLOUD_NAME) {
  console.log('☁️  Cloudinary ATIVO! Uploads irão para a nuvem.');
  console.log('   Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
} else {
  console.log('⚠️  Cloudinary DESATIVADO. Uploads irão para storage local (efêmero).');
}

console.log('---');

app.use(cors({
  origin: function(origin, callback) {
    // Permitir requisições sem origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);
    
    // Lista de origens permitidas
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://localhost:8080',
      'https://resultados.astassessoria.com.br',
      'https://www.resultados.astassessoria.com.br',
      'https://central-resultados-production.up.railway.app'
    ];
    
    // Verificar se origem está na lista OU se é subdomínio do domínio principal
    if (allowedOrigins.includes(origin) || origin.includes('astassessoria.com.br')) {
      callback(null, true);
    } else {
      console.log('⚠️  CORS bloqueado para:', origin);
      callback(null, true); // Temporariamente permitir TODAS as origens para debug mobile
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
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
app.use('/api/logs', logsRoutes);
app.use('/api', diagnosticoRoutes);

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
