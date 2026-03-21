const Joi = require('joi');
const { Op } = require('sequelize');
const {
  MateriaPrima, CategoriaMP, UnidadeMedida, MovimentacaoEstoque, sequelize,
} = require('../../models');

const schema = Joi.object({
  codigo: Joi.string().max(30).allow('', null),
  nome: Joi.string().max(150).required(),
  descricao: Joi.string().allow('', null),
  categoria_id: Joi.number().integer().required(),
  unidade_medida_id: Joi.number().integer().required(),
  estoque_minimo: Joi.number().min(0).default(0),
  estoque_maximo: Joi.number().min(0).default(0),
  ativo: Joi.boolean(),
});

exports.listarCategorias = async (req, res, next) => {
  try {
    const categorias = await CategoriaMP.findAll({ order: [['nome', 'ASC']] });
    res.json(categorias);
  } catch (err) { next(err); }
};

exports.criarCategoria = async (req, res, next) => {
  try {
    const { error, value } = Joi.object({
      nome: Joi.string().max(100).required(),
      descricao: Joi.string().allow('', null),
    }).validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const categoria = await CategoriaMP.create(value);
    res.status(201).json(categoria);
  } catch (err) { next(err); }
};

exports.listarUnidades = async (req, res, next) => {
  try {
    const unidades = await UnidadeMedida.findAll({ order: [['nome', 'ASC']] });
    res.json(unidades);
  } catch (err) { next(err); }
};

exports.criarUnidade = async (req, res, next) => {
  try {
    const { error, value } = Joi.object({
      nome: Joi.string().max(50).required(),
      sigla: Joi.string().max(10).required(),
    }).validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const unidade = await UnidadeMedida.create(value);
    res.status(201).json(unidade);
  } catch (err) { next(err); }
};

exports.listar = async (req, res, next) => {
  try {
    const { ativo, categoria_id, search } = req.query;
    const where = {};
    if (ativo !== undefined) where.ativo = ativo === 'true';
    if (categoria_id) where.categoria_id = categoria_id;
    if (search) where.nome = { [Op.like]: `%${search}%` };

    const materias = await MateriaPrima.findAll({
      where,
      include: [
        { model: CategoriaMP, as: 'categoria' },
        { model: UnidadeMedida, as: 'unidadeMedida' },
      ],
      order: [['nome', 'ASC']],
    });
    res.json(materias);
  } catch (err) { next(err); }
};

exports.criar = async (req, res, next) => {
  try {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const materia = await MateriaPrima.create(value);
    res.status(201).json(materia);
  } catch (err) { next(err); }
};

exports.buscar = async (req, res, next) => {
  try {
    const materia = await MateriaPrima.findByPk(req.params.id, {
      include: [
        { model: CategoriaMP, as: 'categoria' },
        { model: UnidadeMedida, as: 'unidadeMedida' },
      ],
    });
    if (!materia) return res.status(404).json({ error: 'Matéria-prima não encontrada.' });
    res.json(materia);
  } catch (err) { next(err); }
};

exports.atualizar = async (req, res, next) => {
  try {
    const { error, value } = schema.fork(Object.keys(schema.describe().keys), f => f.optional()).validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const materia = await MateriaPrima.findByPk(req.params.id);
    if (!materia) return res.status(404).json({ error: 'Matéria-prima não encontrada.' });

    await materia.update(value);
    res.json(materia);
  } catch (err) { next(err); }
};

exports.toggleAtivo = async (req, res, next) => {
  try {
    const materia = await MateriaPrima.findByPk(req.params.id);
    if (!materia) return res.status(404).json({ error: 'Matéria-prima não encontrada.' });
    await materia.update({ ativo: !materia.ativo });
    res.json({ ativo: materia.ativo });
  } catch (err) { next(err); }
};

exports.movimentacoes = async (req, res, next) => {
  try {
    const movs = await MovimentacaoEstoque.findAll({
      where: { materia_prima_id: req.params.id },
      order: [['data_movimentacao', 'DESC']],
      limit: 100,
    });
    res.json(movs);
  } catch (err) { next(err); }
};

exports.ajusteEstoque = async (req, res, next) => {
  try {
    const { error, value } = Joi.object({
      quantidade: Joi.number().required(),
      observacoes: Joi.string().required(),
    }).validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const materia = await MateriaPrima.findByPk(req.params.id);
    if (!materia) return res.status(404).json({ error: 'Matéria-prima não encontrada.' });

    const saldoAnterior = parseFloat(materia.estoque_atual);
    const novoSaldo = saldoAnterior + value.quantidade;

    if (novoSaldo < 0) {
      return res.status(400).json({ error: 'Ajuste resultaria em estoque negativo.' });
    }

    await sequelize.transaction(async (t) => {
      await materia.update({ estoque_atual: novoSaldo }, { transaction: t });
      await MovimentacaoEstoque.create({
        materia_prima_id: materia.id,
        tipo: 'ajuste',
        quantidade: Math.abs(value.quantidade),
        saldo_anterior: saldoAnterior,
        saldo_posterior: novoSaldo,
        origem_tipo: 'ajuste',
        usuario_id: req.usuario.id,
        data_movimentacao: new Date(),
        observacoes: value.observacoes,
      }, { transaction: t });
    });

    res.json({ message: 'Ajuste realizado.', estoque_atual: novoSaldo });
  } catch (err) { next(err); }
};

exports.alertasEstoque = async (req, res, next) => {
  try {
    const alertas = await MateriaPrima.findAll({
      where: {
        ativo: true,
        estoque_atual: { [Op.lte]: sequelize.col('estoque_minimo') },
      },
      include: [{ model: UnidadeMedida, as: 'unidadeMedida' }],
    });
    res.json(alertas);
  } catch (err) { next(err); }
};
