const Joi = require('joi');
const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../../config/app');
const { Tenant, Usuario, CategoriaMP, sequelize } = require('../../models');

const schemaRegistro = Joi.object({
  // Tipo de conta
  tipo: Joi.string().valid('pf', 'pj').required(),

  // PF
  cpf: Joi.when('tipo', {
    is: 'pf',
    then: Joi.string().length(11).pattern(/^\d+$/).required().messages({
      'string.length': 'CPF deve ter 11 dígitos.',
      'string.pattern.base': 'CPF deve conter apenas números.',
    }),
    otherwise: Joi.forbidden(),
  }),
  nome: Joi.when('tipo', {
    is: 'pf',
    then: Joi.string().max(150).required(),
    otherwise: Joi.optional(),
  }),

  // PJ
  cnpj: Joi.when('tipo', {
    is: 'pj',
    then: Joi.string().length(14).pattern(/^\d+$/).required().messages({
      'string.length': 'CNPJ deve ter 14 dígitos.',
      'string.pattern.base': 'CNPJ deve conter apenas números.',
    }),
    otherwise: Joi.forbidden(),
  }),
  razao_social: Joi.when('tipo', {
    is: 'pj',
    then: Joi.string().max(150).required(),
    otherwise: Joi.optional(),
  }),
  nome_fantasia: Joi.string().max(150).allow('', null).optional(),

  // Comuns
  email_contato: Joi.string().email().required(),
  telefone: Joi.string().max(20).allow('', null).optional(),

  // Usuário admin inicial
  admin_nome: Joi.string().max(100).required(),
  admin_email: Joi.string().email().required(),
  admin_senha: Joi.string().min(6).required(),
});

// Categorias padrão criadas para cada novo tenant
const CATEGORIAS_PADRAO = [
  'Óleos Vegetais',
  'Óleos Essenciais',
  'Essência Hidrossoluvel',
  'Ativos',
  'Emulsificantes',
  'Conservantes',
  'Aromas',
  'Outros',
];

exports.registrar = async (req, res, next) => {
  try {
    const { error, value } = schemaRegistro.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    // Verifica duplicidade de e-mail do admin
    const emailExiste = await Usuario.findOne({
      where: { email: value.admin_email },
    });
    if (emailExiste) {
      return res.status(409).json({ error: 'Este e-mail já está em uso.' });
    }

    const nome = value.tipo === 'pf' ? value.nome : value.razao_social;
    const documento = value.tipo === 'pf' ? value.cpf : value.cnpj;
    const slug = gerarSlug(nome);

    const trialExpira = new Date();
    trialExpira.setDate(trialExpira.getDate() + 30);

    const { tenant, usuario } = await sequelize.transaction(async (t) => {
      const novoTenant = await Tenant.create({
        tipo: value.tipo,
        documento,
        nome,
        nome_fantasia: value.nome_fantasia ?? null,
        email_contato: value.email_contato,
        telefone: value.telefone ?? null,
        slug,
        plano: 'trial',
        ativo: true,
        trial_expira: trialExpira,
      }, { transaction: t });

      const novoUsuario = await Usuario.create({
        empresa_id: novoTenant.id,
        nome: value.admin_nome,
        email: value.admin_email,
        senha_hash: value.admin_senha,
        perfil: 'admin',
        ativo: true,
      }, { transaction: t });

      // Seed de categorias padrão para o tenant
      for (const nomeCat of CATEGORIAS_PADRAO) {
        await CategoriaMP.create({
          empresa_id: novoTenant.id,
          nome: nomeCat,
        }, { transaction: t });
      }

      return { tenant: novoTenant, usuario: novoUsuario };
    });

    // Retorna JWT já logado para que o frontend possa entrar direto
    const token = jwt.sign(
      { id: usuario.id, perfil: usuario.perfil, empresa_id: usuario.empresa_id },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    res.status(201).json({
      message: 'Conta criada com sucesso. Você tem 30 dias de trial gratuito.',
      token,
      usuario,
      tenant,
    });
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
