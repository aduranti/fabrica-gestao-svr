const Joi = require('joi');
const { Usuario } = require('../../models');

const schema = Joi.object({
  nome: Joi.string().max(100).required(),
  email: Joi.string().email().required(),
  senha_hash: Joi.string().min(6).required(),
  perfil: Joi.string().valid('admin', 'operador', 'comprador').required(),
  ativo: Joi.boolean(),
});

exports.listar = async (req, res, next) => {
  try {
    const usuarios = await Usuario.findAll({ order: [['nome', 'ASC']] });
    res.json(usuarios);
  } catch (err) { next(err); }
};

exports.criar = async (req, res, next) => {
  try {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const usuario = await Usuario.create(value);
    res.status(201).json(usuario);
  } catch (err) { next(err); }
};

exports.buscar = async (req, res, next) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(usuario);
  } catch (err) { next(err); }
};

exports.atualizar = async (req, res, next) => {
  try {
    const schemaUpdate = schema.fork(['senha_hash'], f => f.optional());
    const { error, value } = schemaUpdate.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado.' });

    await usuario.update(value);
    res.json(usuario);
  } catch (err) { next(err); }
};

exports.toggleAtivo = async (req, res, next) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado.' });

    await usuario.update({ ativo: !usuario.ativo });
    res.json({ ativo: usuario.ativo });
  } catch (err) { next(err); }
};
