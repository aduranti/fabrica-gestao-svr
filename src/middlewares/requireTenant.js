const { Tenant } = require('../models');

module.exports = async (req, res, next) => {
  if (!req.usuario?.empresa_id) {
    return res.status(403).json({ error: 'Acesso restrito a usuários de um tenant.' });
  }

  const tenant = await Tenant.findOne({
    where: { id: req.usuario.empresa_id, ativo: true },
  });

  if (!tenant) {
    return res.status(403).json({ error: 'Tenant inativo ou não encontrado.' });
  }

  if (tenant.plano === 'trial' && tenant.trial_expira && new Date(tenant.trial_expira) < new Date()) {
    return res.status(402).json({ error: 'Período de trial encerrado. Faça upgrade do seu plano.' });
  }

  req.empresa = tenant;
  next();
};
