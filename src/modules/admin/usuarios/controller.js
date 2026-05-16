const Joi = require('joi');
const { Usuario } = require('../../../models');

const schema = Joi.object({
  nome: Joi.string().max(100).required(),
  email: Joi.string().email().required(),
  senha: Joi.string().min(6).required(),
  perfil: Joi.string().valid('admin', 'operador', 'comprador').required(),
  ativo: Joi.boolean().default(true),
});

exports.listar = async (req, res, next) => {
  try {
    const usuarios = await Usuario.findAll({
      where: { empresa_id: req.empresa.id },
      order: [['nome', 'ASC']],
    });
    res.json(usuarios);
  } catch (err) { next(err); }
};

exports.criar = async (req, res, next) => {
  try {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const existe = await Usuario.findOne({ where: { email: value.email, empresa_id: req.empresa.id } });
    if (existe) return res.status(409).json({ error: 'E-mail já cadastrado neste tenant.' });

    const usuario = await Usuario.create({
      empresa_id: req.empresa.id,
      nome: value.nome,
      email: value.email,
      senha_hash: value.senha,
      perfil: value.perfil,
      ativo: value.ativo,
    });

    res.status(201).json(usuario);
  } catch (err) { next(err); }
};

exports.atualizar = async (req, res, next) => {
  try {
    const schemaUpdate = Joi.object({
      nome: Joi.string().max(100),
      email: Joi.string().email(),
      perfil: Joi.string().valid('admin', 'operador', 'comprador'),
      ativo: Joi.boolean(),
    });

    const { error, value } = schemaUpdate.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const usuario = await Usuario.findOne({ where: { id: req.params.id, empresa_id: req.empresa.id } });
    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado.' });

    // Admin não pode alterar seu próprio perfil
    if (usuario.id === req.usuario.id && value.perfil && value.perfil !== 'admin') {
      return res.status(400).json({ error: 'Você não pode rebaixar seu próprio perfil.' });
    }

    await usuario.update(value);
    res.json(usuario);
  } catch (err) { next(err); }
};

exports.redefinirSenha = async (req, res, next) => {
  try {
    const { nova_senha } = req.body;
    if (!nova_senha || nova_senha.length < 6) {
      return res.status(400).json({ error: 'nova_senha deve ter ao menos 6 caracteres.' });
    }

    const usuario = await Usuario.findOne({ where: { id: req.params.id, empresa_id: req.empresa.id } });
    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado.' });

    await usuario.update({ senha_hash: nova_senha });
    res.json({ message: 'Senha redefinida com sucesso.' });
  } catch (err) { next(err); }
};

exports.toggleAtivo = async (req, res, next) => {
  try {
    const usuario = await Usuario.findOne({ where: { id: req.params.id, empresa_id: req.empresa.id } });
    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado.' });
    if (usuario.id === req.usuario.id) {
      return res.status(400).json({ error: 'Você não pode desativar sua própria conta.' });
    }

    await usuario.update({ ativo: !usuario.ativo });
    res.json({ ativo: usuario.ativo });
  } catch (err) { next(err); }
};
