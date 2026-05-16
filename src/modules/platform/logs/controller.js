const Joi = require('joi');
const { LogAuditoria, Usuario, Tenant } = require('../../../models');
const { Op } = require('sequelize');

exports.listar = async (req, res, next) => {
  try {
    const schema = Joi.object({
      empresa_id: Joi.number().integer().allow(null, ''),
      usuario_id: Joi.number().integer().allow(null, ''),
      acao: Joi.string().allow(null, ''),
      entidade: Joi.string().allow(null, ''),
      data_inicio: Joi.date().allow(null, ''),
      data_fim: Joi.date().allow(null, ''),
      limit: Joi.number().integer().min(1).max(500).default(100),
      offset: Joi.number().integer().min(0).default(0),
    });

    const { error, value } = schema.validate(req.query);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const where = {};
    if (value.empresa_id) where.empresa_id = value.empresa_id;
    if (value.usuario_id) where.usuario_id = value.usuario_id;
    if (value.acao) where.acao = value.acao;
    if (value.entidade) where.entidade = value.entidade;
    if (value.data_inicio || value.data_fim) {
      where.created_at = {};
      if (value.data_inicio) where.created_at[Op.gte] = value.data_inicio;
      if (value.data_fim) where.created_at[Op.lte] = value.data_fim;
    }

    const { rows: logs, count } = await LogAuditoria.findAndCountAll({
      where,
      include: [
        { model: Tenant, as: 'tenant', attributes: ['id', 'nome'] },
        { model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'email'] },
      ],
      order: [['created_at', 'DESC']],
      limit: value.limit,
      offset: value.offset,
    });

    res.json({ total: count, logs });
  } catch (err) { next(err); }
};
