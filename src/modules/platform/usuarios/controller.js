const Joi = require('joi');
const { Usuario, Tenant } = require('../../../models');

const schema = Joi.object({
  empresa_id: Joi.number().integer().allow(null),
  nome: Joi.string().max(100).required(),
  email: Joi.string().email().required(),
  senha: Joi.string().min(6).required(),
  perfil: Joi.string().valid('super_admin', 'admin', 'operador', 'comprador').required(),
  ativo: Joi.boolean().default(true),
});

exports.listar = async (req, res, next) => {
  try {
    const { empresa_id, perfil } = req.query;
    const where = {};
    if (empresa_id) where.empresa_id = empresa_id;
    if (perfil) where.perfil = perfil;

    const usuarios = await Usuario.findAll({
      where,
      include: [{ model: Tenant, as: 'tenant', attributes: ['id', 'nome', 'plano'] }],
      order: [['nome', 'ASC']],
    });
    res.json(usuarios);
  } catch (err) { next(err); }
};

exports.criar = async (req, res, next) => {
  try {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    if (value.perfil !== 'super_admin' && !value.empresa_id) {
      return res.status(400).json({ error: 'empresa_id é obrigatório para perfis não super_admin.' });
    }

    const usuario = await Usuario.create({
      empresa_id: value.empresa_id ?? null,
      nome: value.nome,
      email: value.email,
      senha_hash: value.senha,
      perfil: value.perfil,
      ativo: value.ativo,
    });

    res.status(201).json(usuario);
  } catch (err) { next(err); }
};

exports.desativar = async (req, res, next) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado.' });
    if (usuario.perfil === 'super_admin' && usuario.id === req.usuario.id) {
      return res.status(400).json({ error: 'Você não pode desativar sua própria conta.' });
    }

    await usuario.update({ ativo: !usuario.ativo });
    res.json({ ativo: usuario.ativo });
  } catch (err) { next(err); }
};
