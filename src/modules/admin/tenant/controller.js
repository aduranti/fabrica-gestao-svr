const Joi = require('joi');
const { Tenant } = require('../../../models');

const schemaUpdate = Joi.object({
  nome: Joi.string().max(150),
  nome_fantasia: Joi.string().max(150).allow('', null),
  email_contato: Joi.string().email(),
  telefone: Joi.string().max(20).allow('', null),
  documento: Joi.string().max(20).allow('', null),
});

exports.meuTenant = async (req, res, next) => {
  try {
    res.json(req.empresa);
  } catch (err) { next(err); }
};

exports.atualizar = async (req, res, next) => {
  try {
    const { error, value } = schemaUpdate.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    await req.empresa.update(value);
    res.json(req.empresa);
  } catch (err) { next(err); }
};
