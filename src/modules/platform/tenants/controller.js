const Joi = require('joi');
const bcrypt = require('bcryptjs');
const { Tenant, Usuario, sequelize } = require('../../../models');
const { registrarLog } = require('../../../utils/log');

const schemaTenant = Joi.object({
  tipo: Joi.string().valid('pf', 'pj').required(),
  documento: Joi.string().max(20).allow('', null),
  nome: Joi.string().max(150).required(),
  nome_fantasia: Joi.string().max(150).allow('', null),
  email_contato: Joi.string().email().required(),
  telefone: Joi.string().max(20).allow('', null),
  plano: Joi.string().valid('trial', 'basico', 'profissional').default('trial'),
  ativo: Joi.boolean().default(true),
  trial_expira: Joi.date().allow(null),
  // Usuário admin inicial (obrigatório ao criar)
  admin_nome: Joi.string().max(100),
  admin_email: Joi.string().email(),
  admin_senha: Joi.string().min(6),
});

exports.listar = async (req, res, next) => {
  try {
    const { ativo, plano } = req.query;
    const where = {};
    if (ativo !== undefined) where.ativo = ativo === 'true';
    if (plano) where.plano = plano;

    const tenants = await Tenant.findAll({
      where,
      include: [{ model: Usuario, attributes: ['id', 'nome', 'email', 'perfil', 'ativo'] }],
      order: [['nome', 'ASC']],
    });
    res.json(tenants);
  } catch (err) { next(err); }
};

exports.buscar = async (req, res, next) => {
  try {
    const tenant = await Tenant.findByPk(req.params.id, {
      include: [{ model: Usuario, attributes: ['id', 'nome', 'email', 'perfil', 'ativo', 'ultimo_acesso'] }],
    });
    if (!tenant) return res.status(404).json({ error: 'Tenant não encontrado.' });
    res.json(tenant);
  } catch (err) { next(err); }
};

exports.criar = async (req, res, next) => {
  try {
    const { error, value } = schemaTenant.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    if (!value.admin_nome || !value.admin_email || !value.admin_senha) {
      return res.status(400).json({ error: 'Dados do admin inicial são obrigatórios (admin_nome, admin_email, admin_senha).' });
    }

    const slug = gerarSlug(value.nome);

    const tenant = await sequelize.transaction(async (t) => {
      const novoTenant = await Tenant.create({
        tipo: value.tipo,
        documento: value.documento,
        nome: value.nome,
        nome_fantasia: value.nome_fantasia,
        email_contato: value.email_contato,
        telefone: value.telefone,
        slug,
        plano: value.plano,
        ativo: value.ativo,
        trial_expira: value.trial_expira,
      }, { transaction: t });

      await Usuario.create({
        empresa_id: novoTenant.id,
        nome: value.admin_nome,
        email: value.admin_email,
        senha_hash: value.admin_senha,
        perfil: 'admin',
        ativo: true,
      }, { transaction: t });

      return novoTenant;
    });

    await registrarLog(req, { acao: 'criar', entidade: 'Tenant', entidade_id: tenant.id, dados_novos: { nome: tenant.nome, plano: tenant.plano } });
    res.status(201).json(tenant);
  } catch (err) { next(err); }
};

exports.atualizar = async (req, res, next) => {
  try {
    const schema = Joi.object({
      tipo: Joi.string().valid('pf', 'pj'),
      documento: Joi.string().max(20).allow('', null),
      nome: Joi.string().max(150),
      nome_fantasia: Joi.string().max(150).allow('', null),
      email_contato: Joi.string().email(),
      telefone: Joi.string().max(20).allow('', null),
      plano: Joi.string().valid('trial', 'basico', 'profissional'),
      trial_expira: Joi.date().allow(null),
    });

    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const tenant = await Tenant.findByPk(req.params.id);
    if (!tenant) return res.status(404).json({ error: 'Tenant não encontrado.' });

    const anterior = tenant.toJSON();
    await tenant.update(value);

    await registrarLog(req, { acao: 'atualizar', entidade: 'Tenant', entidade_id: tenant.id, dados_anteriores: anterior, dados_novos: value });
    res.json(tenant);
  } catch (err) { next(err); }
};

exports.suspender = async (req, res, next) => {
  try {
    const tenant = await Tenant.findByPk(req.params.id);
    if (!tenant) return res.status(404).json({ error: 'Tenant não encontrado.' });

    await tenant.update({ ativo: !tenant.ativo });
    await registrarLog(req, { acao: 'atualizar', entidade: 'Tenant', entidade_id: tenant.id, dados_novos: { ativo: tenant.ativo } });
    res.json({ ativo: tenant.ativo });
  } catch (err) { next(err); }
};

function gerarSlug(nome) {
  const base = nome
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
  return `${base}-${Date.now().toString(36)}`;
}
