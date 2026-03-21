require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const { port, env, cors: corsConfig } = require('./config/app');
const { sequelize } = require('./models');
const errorHandler = require('./middlewares/errorHandler');
const swaggerSpec = require('./config/swagger');

// Rotas
const authRoutes = require('./modules/auth/routes');
const usuariosRoutes = require('./modules/usuarios/routes');
const fornecedoresRoutes = require('./modules/fornecedores/routes');
const materiasPrimasRoutes = require('./modules/materias-primas/routes');
const comprasRoutes = require('./modules/compras/routes');
const formulasRoutes = require('./modules/formulas/routes');
const producaoRoutes = require('./modules/producao/routes');
const produtosRoutes = require('./modules/produtos/routes');

const app = express();

// Middlewares globais
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: corsConfig.origin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (env !== 'test') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', ambiente: env, timestamp: new Date().toISOString() });
});

// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Fábrica Gestão API',
  swaggerOptions: { persistAuthorization: true },
}));
app.get('/docs.json', (req, res) => res.json(swaggerSpec));

// API Routes
const API = '/api/v1';
app.use(`${API}/auth`, authRoutes);
app.use(`${API}/usuarios`, usuariosRoutes);
app.use(`${API}/fornecedores`, fornecedoresRoutes);
app.use(`${API}/materias-primas`, materiasPrimasRoutes);
app.use(`${API}/compras`, comprasRoutes);
app.use(`${API}/formulas`, formulasRoutes);
app.use(`${API}/producao`, producaoRoutes);
app.use(`${API}/produtos`, produtosRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

// Error handler global
app.use(errorHandler);

// Inicialização
async function iniciar() {
  try {
    await sequelize.authenticate();
    console.log('✅ Banco de dados conectado.');

    app.listen(port, () => {
      console.log(`🚀 Servidor rodando na porta ${port} [${env}]`);
      console.log(`📋 Health: http://localhost:${port}/health`);
      console.log(`🔗 API:    http://localhost:${port}${API}`);
      console.log(`📖 Docs:   http://localhost:${port}/docs`);
    });
  } catch (err) {
    console.error('❌ Falha ao conectar banco de dados:', err.message);
    process.exit(1);
  }
}

iniciar();

module.exports = app;
