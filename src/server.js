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
const auth = require('./middlewares/auth');
const requireTenant = require('./middlewares/requireTenant');
const permissions = require('./middlewares/permissions');

// ── Rotas públicas ────────────────────────────────────────────────
const authRoutes = require('./modules/auth/routes');
const registerRoutes = require('./modules/register/routes');

// ── Rotas plataforma (super_admin) ────────────────────────────────
const platformTenantsRoutes = require('./modules/platform/tenants/routes');
const platformUsuariosRoutes = require('./modules/platform/usuarios/routes');
const platformLogsRoutes = require('./modules/platform/logs/routes');

// ── Rotas admin do tenant ─────────────────────────────────────────
const adminUsuariosRoutes = require('./modules/admin/usuarios/routes');
const adminTenantRoutes = require('./modules/admin/tenant/routes');
const adminLogsRoutes = require('./modules/admin/logs/routes');

// ── Rotas operacionais (operador / comprador) ─────────────────────
const fornecedoresRoutes = require('./modules/fornecedores/routes');
const materiasPrimasRoutes = require('./modules/materias-primas/routes');
const comprasRoutes = require('./modules/compras/routes');
const formulasRoutes = require('./modules/formulas/routes');
const producaoRoutes = require('./modules/producao/routes');
const produtosRoutes = require('./modules/produtos/routes');
const relatoriosRoutes = require('./modules/relatorios/routes');
const backupRoutes = require('./modules/backup/routes');
const vendasRoutes = require('./modules/vendas/routes');
const clientesRoutes = require('./modules/clientes/routes');
const usuariosRoutes = require('./modules/usuarios/routes');

const app = express();

// ── Middlewares globais ───────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: corsConfig.origin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (env !== 'test') {
  app.use(morgan('dev'));
}

// ── Health check ──────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', ambiente: env, timestamp: new Date().toISOString() });
});

// ── Swagger UI ────────────────────────────────────────────────────
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Fábrica Gestão API',
  swaggerOptions: { persistAuthorization: true },
}));
app.get('/docs.json', (req, res) => res.json(swaggerSpec));

const API = '/api/v1';

// ── Rotas públicas ────────────────────────────────────────────────
app.use(`${API}/auth`, authRoutes);
app.use(`${API}/register`, registerRoutes);

// ── Rotas plataforma: apenas super_admin ──────────────────────────
const platformGuard = [auth, permissions('super_admin')];
app.use(`${API}/platform/tenants`, platformGuard, platformTenantsRoutes);
app.use(`${API}/platform/usuarios`, platformGuard, platformUsuariosRoutes);
app.use(`${API}/platform/logs`, platformGuard, platformLogsRoutes);

// ── Rotas admin do tenant: apenas admin ───────────────────────────
const adminGuard = [auth, requireTenant, permissions('admin')];
app.use(`${API}/admin/usuarios`, adminGuard, adminUsuariosRoutes);
app.use(`${API}/admin/tenant`, adminGuard, adminTenantRoutes);
app.use(`${API}/admin/logs`, adminGuard, adminLogsRoutes);

// ── Rotas operacionais: qualquer usuário autenticado do tenant ────
const tenantGuard = [auth, requireTenant];
app.use(`${API}/usuarios`, tenantGuard, usuariosRoutes);
app.use(`${API}/fornecedores`, tenantGuard, fornecedoresRoutes);
app.use(`${API}/materias-primas`, tenantGuard, materiasPrimasRoutes);
app.use(`${API}/compras`, tenantGuard, comprasRoutes);
app.use(`${API}/formulas`, tenantGuard, formulasRoutes);
app.use(`${API}/producao`, tenantGuard, producaoRoutes);
app.use(`${API}/produtos`, tenantGuard, produtosRoutes);
app.use(`${API}/relatorios`, tenantGuard, relatoriosRoutes);
app.use(`${API}/backup`, tenantGuard, backupRoutes);
app.use(`${API}/vendas`, tenantGuard, vendasRoutes);
app.use(`${API}/clientes`, tenantGuard, clientesRoutes);

// ── 404 ───────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

// ── Error handler global ──────────────────────────────────────────
app.use(errorHandler);

// ── Inicialização ─────────────────────────────────────────────────
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
