const Joi = require('joi');
const { Op } = require('sequelize');
const { Produto, LoteProduto, Formula, UnidadeMedida, sequelize } = require('../../models');

const schema = Joi.object({
  codigo: Joi.string().max(30).allow('', null),
  nome: Joi.string().max(150).required(),
  formula_id: Joi.number().integer().allow(null),
  unidade_medida_id: Joi.number().integer().required(),
  preco_custo: Joi.number().min(0).default(0),
  preco_venda: Joi.number().min(0).default(0),
  estoque_minimo: Joi.number().min(0).default(0),
  ativo: Joi.boolean(),
});

exports.listar = async (req, res, next) => {
  try {
    const produtos = await Produto.findAll({
      where: { empresa_id: req.empresa.id },
      include: [
        { model: UnidadeMedida, as: 'unidadeMedida' },
        { model: Formula, as: 'formula', attributes: ['id', 'nome', 'categoria'] },
      ],
      order: [['nome', 'ASC']],
    });
    res.json(produtos);
  } catch (err) { next(err); }
};

exports.criar = async (req, res, next) => {
  try {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const produto = await Produto.create({ ...value, empresa_id: req.empresa.id });
    res.status(201).json(produto);
  } catch (err) { next(err); }
};

exports.buscar = async (req, res, next) => {
  try {
    const produto = await Produto.findOne({
      where: { id: req.params.id, empresa_id: req.empresa.id },
      include: [
        { model: UnidadeMedida, as: 'unidadeMedida' },
        { model: Formula, as: 'formula' },
      ],
    });
    if (!produto) return res.status(404).json({ error: 'Produto não encontrado.' });
    res.json(produto);
  } catch (err) { next(err); }
};

exports.atualizar = async (req, res, next) => {
  try {
    const { error, value } = schema.fork(Object.keys(schema.describe().keys), f => f.optional()).validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const produto = await Produto.findOne({ where: { id: req.params.id, empresa_id: req.empresa.id } });
    if (!produto) return res.status(404).json({ error: 'Produto não encontrado.' });

    await produto.update(value);
    res.json(produto);
  } catch (err) { next(err); }
};

exports.listarLotes = async (req, res, next) => {
  try {
    const produto = await Produto.findOne({ where: { id: req.params.id, empresa_id: req.empresa.id } });
    if (!produto) return res.status(404).json({ error: 'Produto não encontrado.' });

    const lotes = await LoteProduto.findAll({
      where: { produto_id: req.params.id, empresa_id: req.empresa.id },
      order: [['data_fabricacao', 'DESC']],
    });
    res.json(lotes);
  } catch (err) { next(err); }
};

exports.alertasEstoque = async (req, res, next) => {
  try {
    const alertas = await Produto.findAll({
      where: {
        empresa_id: req.empresa.id,
        ativo: true,
        estoque_atual: { [Op.lte]: sequelize.col('estoque_minimo') },
      },
      include: [{ model: UnidadeMedida, as: 'unidadeMedida' }],
    });
    res.json(alertas);
  } catch (err) { next(err); }
};
