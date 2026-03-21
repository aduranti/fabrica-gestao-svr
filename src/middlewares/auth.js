const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/app');
const { Usuario } = require('../models');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    const usuario = await Usuario.findByPk(decoded.id);

    if (!usuario || !usuario.ativo) {
      return res.status(401).json({ error: 'Usuário inativo ou não encontrado.' });
    }

    req.usuario = usuario;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};
