const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { jwt: jwtConfig } = require('../../config/app');
const { Usuario } = require('../../models');

exports.login = async (req, res, next) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      senha: Joi.string().required(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const usuario = await Usuario.findOne({ where: { email: value.email, ativo: true } });

    if (!usuario || !(await usuario.validarSenha(value.senha))) {
      return res.status(401).json({ error: 'Email ou senha incorretos.' });
    }

    const token = jwt.sign(
      { id: usuario.id, perfil: usuario.perfil },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    res.json({ token, usuario });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res) => {
  res.json({ message: 'Logout realizado com sucesso.' });
};

exports.me = async (req, res) => {
  res.json(req.usuario);
};

exports.alterarSenha = async (req, res, next) => {
  try {
    const schema = Joi.object({
      senha_atual: Joi.string().required(),
      nova_senha: Joi.string().min(6).required(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const usuario = req.usuario;

    if (!(await usuario.validarSenha(value.senha_atual))) {
      return res.status(400).json({ error: 'Senha atual incorreta.' });
    }

    await usuario.update({ senha_hash: value.nova_senha });
    res.json({ message: 'Senha alterada com sucesso.' });
  } catch (err) {
    next(err);
  }
};
