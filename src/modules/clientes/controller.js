const Joi = require('joi');
const { Cliente } = require('../../models');

const schema = Joi.object({
  nome: Joi.string().max(150).required(),
  cpf_cnpj: Joi.string().max(20).allow('', null).optional(),
  telefone: Joi.string().max(20).allow('', null).optional(),
  email: Joi.string().email().max(100).allow('', null).optional(),
  endereco: Joi.string().max(250).allow('', null).optional(),
  observacao: Joi.string().allow('', null).optional(),
  ativo: Joi.boolean().default(true),
});

exports.listar = async (req, res, next) => {
  try {
    const clientes = await Cliente.findAll({ order: [['nome', 'ASC']] });
    res.json(clientes);
  } catch (err) { next(err); }
};

exports.buscarPorId = async (req, res, next) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado.' });
    res.json(cliente);
  } catch (err) { next(err); }
};

exports.criar = async (req, res, next) => {
  try {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const cliente = await Cliente.create(value);
    res.status(201).json(cliente);
  } catch (err) { next(err); }
};

exports.atualizar = async (req, res, next) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado.' });
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    await cliente.update(value);
    res.json(cliente);
  } catch (err) { next(err); }
};

exports.excluir = async (req, res, next) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado.' });
    await cliente.update({ ativo: false });
    res.json({ message: 'Cliente inativado com sucesso.' });
  } catch (err) { next(err); }
};
