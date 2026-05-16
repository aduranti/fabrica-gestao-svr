const Joi = require('joi');
const {
  Formula, FormulaIngrediente, FormulaVersao, MateriaPrima, UnidadeMedida, sequelize,
} = require('../../models');

const schemaIngrediente = Joi.object({
  materia_prima_id: Joi.number().integer().required(),
  quantidade: Joi.number().positive().required(),
  unidade_medida_id: Joi.number().integer().required(),
  percentual: Joi.number().min(0).max(100).allow(null),
  fase: Joi.string().valid('aquosa', 'oleosa', 'esfriamento', 'final', 'unica').default('unica'),
  ordem: Joi.number().integer().default(0),
  observacoes: Joi.string().max(255).allow('', null),
});

const schemaFormula = Joi.object({
  codigo: Joi.string().max(30).allow('', null),
  nome: Joi.string().max(150).required(),
  descricao: Joi.string().allow('', null),
  categoria: Joi.string().valid('sabonete', 'tintura', 'pomada').required(),
  rendimento_quantidade: Joi.number().positive().required(),
  rendimento_unidade_id: Joi.number().integer().required(),
  instrucoes_producao: Joi.string().allow('', null),
  observacoes: Joi.string().allow('', null),
  ingredientes: Joi.array().items(schemaIngrediente).min(1).required(),
  motivo_alteracao: Joi.string().max(255).allow('', null),
});

exports.listar = async (req, res, next) => {
  try {
    const { categoria, status } = req.query;
    const where = { empresa_id: req.empresa.id };
    if (categoria) where.categoria = categoria;
    if (status) where.status = status;

    const formulas = await Formula.findAll({
      where,
      include: [{ model: UnidadeMedida, as: 'rendimentoUnidade' }],
      order: [['nome', 'ASC']],
    });
    res.json(formulas);
  } catch (err) { next(err); }
};

exports.criar = async (req, res, next) => {
  try {
    const { error, value } = schemaFormula.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const formula = await sequelize.transaction(async (t) => {
      const novaFormula = await Formula.create({
        ...value,
        empresa_id: req.empresa.id,
        usuario_criacao_id: req.usuario.id,
        versao: 1,
      }, { transaction: t });

      for (const ing of value.ingredientes) {
        await FormulaIngrediente.create({ formula_id: novaFormula.id, ...ing }, { transaction: t });
      }

      await FormulaVersao.create({
        formula_id: novaFormula.id,
        versao: 1,
        snapshot_json: { ...value },
        usuario_id: req.usuario.id,
        data_versao: new Date(),
        motivo_alteracao: 'Criação inicial',
      }, { transaction: t });

      return novaFormula;
    });

    res.status(201).json(await buscarFormulaCompleta(formula.id, req.empresa.id));
  } catch (err) { next(err); }
};

exports.buscar = async (req, res, next) => {
  try {
    const formula = await buscarFormulaCompleta(req.params.id, req.empresa.id);
    if (!formula) return res.status(404).json({ error: 'Fórmula não encontrada.' });
    res.json(formula);
  } catch (err) { next(err); }
};

exports.atualizar = async (req, res, next) => {
  try {
    const { error, value } = schemaFormula.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const formula = await Formula.findOne({ where: { id: req.params.id, empresa_id: req.empresa.id } });
    if (!formula) return res.status(404).json({ error: 'Fórmula não encontrada.' });

    await sequelize.transaction(async (t) => {
      const novaVersao = formula.versao + 1;
      const ingredientesAtuais = await FormulaIngrediente.findAll({ where: { formula_id: formula.id } });
      await FormulaVersao.create({
        formula_id: formula.id,
        versao: formula.versao,
        snapshot_json: { ...formula.toJSON(), ingredientes: ingredientesAtuais },
        usuario_id: req.usuario.id,
        data_versao: new Date(),
        motivo_alteracao: value.motivo_alteracao || 'Alteração de fórmula',
      }, { transaction: t });

      await FormulaIngrediente.destroy({ where: { formula_id: formula.id }, transaction: t });
      for (const ing of value.ingredientes) {
        await FormulaIngrediente.create({ formula_id: formula.id, ...ing }, { transaction: t });
      }

      await formula.update({ ...value, versao: novaVersao }, { transaction: t });
    });

    res.json(await buscarFormulaCompleta(formula.id, req.empresa.id));
  } catch (err) { next(err); }
};

exports.atualizarStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['rascunho', 'ativa', 'inativa'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido.' });
    }
    const formula = await Formula.findOne({ where: { id: req.params.id, empresa_id: req.empresa.id } });
    if (!formula) return res.status(404).json({ error: 'Fórmula não encontrada.' });
    await formula.update({ status });
    res.json({ status: formula.status });
  } catch (err) { next(err); }
};

exports.listarVersoes = async (req, res, next) => {
  try {
    const formula = await Formula.findOne({ where: { id: req.params.id, empresa_id: req.empresa.id } });
    if (!formula) return res.status(404).json({ error: 'Fórmula não encontrada.' });

    const versoes = await FormulaVersao.findAll({
      where: { formula_id: req.params.id },
      order: [['versao', 'DESC']],
    });
    res.json(versoes);
  } catch (err) { next(err); }
};

exports.calcularCusto = async (req, res, next) => {
  try {
    const quantidade = parseFloat(req.query.quantidade) || 1;
    const formula = await buscarFormulaCompleta(req.params.id, req.empresa.id);
    if (!formula) return res.status(404).json({ error: 'Fórmula não encontrada.' });

    const fator = quantidade / parseFloat(formula.rendimento_quantidade);
    let custoTotal = 0;

    const ingredientesComCusto = await Promise.all(
      formula.ingredientes.map(async (ing) => {
        const mp = await MateriaPrima.findOne({ where: { id: ing.materia_prima_id, empresa_id: req.empresa.id } });
        const qtdAjustada = parseFloat(ing.quantidade) * fator;
        const custo = qtdAjustada * parseFloat(mp.custo_medio);
        custoTotal += custo;
        return {
          materia_prima: mp.nome,
          quantidade: qtdAjustada,
          custo_unitario: mp.custo_medio,
          custo_total: custo,
        };
      })
    );

    res.json({
      formula: formula.nome,
      quantidade_calculada: quantidade,
      custo_total: custoTotal,
      custo_unitario: custoTotal / quantidade,
      ingredientes: ingredientesComCusto,
    });
  } catch (err) { next(err); }
};

async function buscarFormulaCompleta(id, empresaId) {
  return Formula.findOne({
    where: { id, empresa_id: empresaId },
    include: [
      { model: UnidadeMedida, as: 'rendimentoUnidade' },
      {
        model: FormulaIngrediente,
        as: 'ingredientes',
        include: [
          { model: MateriaPrima, as: 'materiaPrima' },
          { model: UnidadeMedida, as: 'unidadeMedida' },
        ],
        order: [['ordem', 'ASC']],
      },
    ],
  });
}
