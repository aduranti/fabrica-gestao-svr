const Joi = require('joi');
const { Op } = require('sequelize');
const { Fornecedor, MateriaPrima } = require('../../models');

const schema = Joi.object({
  razao_social: Joi.string().max(150).required(),
  nome_fantasia: Joi.string().max(150).allow('', null),
  cnpj_cpf: Joi.string().max(20).allow('', null),
  telefone: Joi.string().max(20).allow('', null),
  email: Joi.string().email().allow('', null),
  site: Joi.string().uri().max(200).allow('', null),
  endereco: Joi.string().max(200).allow('', null),
  cidade: Joi.string().max(100).allow('', null),
  estado: Joi.string().max(2).allow('', null),
  cep: Joi.string().max(10).allow('', null),
  ativo: Joi.boolean(),
  observacoes: Joi.string().allow('', null),
});

exports.listar = async (req, res, next) => {
  try {
    const { ativo } = req.query;
    const where = { empresa_id: req.empresa.id };
    if (ativo !== undefined) where.ativo = ativo === 'true';

    const fornecedores = await Fornecedor.findAll({ where, order: [['razao_social', 'ASC']] });
    res.json(fornecedores);
  } catch (err) { next(err); }
};

exports.criar = async (req, res, next) => {
  try {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const fornecedor = await Fornecedor.create({ ...value, empresa_id: req.empresa.id });
    res.status(201).json(fornecedor);
  } catch (err) { next(err); }
};

exports.buscar = async (req, res, next) => {
  try {
    const fornecedor = await Fornecedor.findOne({ where: { id: req.params.id, empresa_id: req.empresa.id } });
    if (!fornecedor) return res.status(404).json({ error: 'Fornecedor não encontrado.' });
    res.json(fornecedor);
  } catch (err) { next(err); }
};

exports.atualizar = async (req, res, next) => {
  try {
    const { error, value } = schema.fork(Object.keys(schema.describe().keys), f => f.optional()).validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const fornecedor = await Fornecedor.findOne({ where: { id: req.params.id, empresa_id: req.empresa.id } });
    if (!fornecedor) return res.status(404).json({ error: 'Fornecedor não encontrado.' });

    await fornecedor.update(value);
    res.json(fornecedor);
  } catch (err) { next(err); }
};

exports.toggleAtivo = async (req, res, next) => {
  try {
    const fornecedor = await Fornecedor.findOne({ where: { id: req.params.id, empresa_id: req.empresa.id } });
    if (!fornecedor) return res.status(404).json({ error: 'Fornecedor não encontrado.' });

    await fornecedor.update({ ativo: !fornecedor.ativo });
    res.json({ ativo: fornecedor.ativo });
  } catch (err) { next(err); }
};

exports.listarMateriasPrimas = async (req, res, next) => {
  try {
    const fornecedor = await Fornecedor.findOne({
      where: { id: req.params.id, empresa_id: req.empresa.id },
      include: [{ model: MateriaPrima, through: { attributes: ['preco_unitario', 'prazo_entrega_dias', 'preferencial'] } }],
    });
    if (!fornecedor) return res.status(404).json({ error: 'Fornecedor não encontrado.' });
    res.json(fornecedor.MateriaPrimas);
  } catch (err) { next(err); }
};
