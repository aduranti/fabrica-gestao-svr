const Joi = require('joi');
const {
  OrdemProducao, OrdemProducaoInsumo, Formula, FormulaIngrediente,
  MateriaPrima, Produto, LoteProduto, MovimentacaoEstoque, sequelize,
} = require('../../models');
const { gerarNumero, gerarNumeroLote } = require('../../utils/numerador');

const schemaOrdem = Joi.object({
  formula_id: Joi.number().integer().required(),
  produto_id: Joi.number().integer().required(),
  quantidade_planejada: Joi.number().positive().required(),
  data_planejada: Joi.date().required(),
  lote: Joi.string().max(50).allow('', null),
  observacoes: Joi.string().allow('', null),
});

exports.listar = async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = { empresa_id: req.empresa.id };
    if (status) where.status = status;

    const ordens = await OrdemProducao.findAll({
      where,
      include: [{ model: Formula, as: 'formula', attributes: ['id', 'nome', 'categoria'] }],
      order: [['data_planejada', 'DESC']],
    });
    res.json(ordens);
  } catch (err) { next(err); }
};

exports.criar = async (req, res, next) => {
  try {
    const { error, value } = schemaOrdem.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const formula = await Formula.findOne({
      where: { id: value.formula_id, empresa_id: req.empresa.id },
      include: [{ model: FormulaIngrediente, as: 'ingredientes' }],
    });
    if (!formula) return res.status(404).json({ error: 'Fórmula não encontrada.' });
    if (formula.status !== 'ativa') return res.status(400).json({ error: 'Somente fórmulas ativas podem ser produzidas.' });

    const fator = value.quantidade_planejada / parseFloat(formula.rendimento_quantidade);

    const deficiencias = [];
    for (const ing of formula.ingredientes) {
      const mp = await MateriaPrima.findOne({ where: { id: ing.materia_prima_id, empresa_id: req.empresa.id } });
      const qtdNecessaria = parseFloat(ing.quantidade) * fator;
      if (parseFloat(mp.estoque_atual) < qtdNecessaria) {
        deficiencias.push({
          materia_prima: mp.nome,
          necessario: qtdNecessaria,
          disponivel: mp.estoque_atual,
          falta: qtdNecessaria - parseFloat(mp.estoque_atual),
        });
      }
    }

    if (deficiencias.length > 0) {
      return res.status(400).json({ error: 'Estoque insuficiente para produção.', deficiencias });
    }

    const ordem = await sequelize.transaction(async (t) => {
      const numero = await gerarNumero(OrdemProducao, 'OP', req.empresa.id);

      const novaOrdem = await OrdemProducao.create({
        empresa_id: req.empresa.id,
        numero,
        formula_id: value.formula_id,
        produto_id: value.produto_id,
        usuario_responsavel_id: req.usuario.id,
        quantidade_planejada: value.quantidade_planejada,
        data_planejada: value.data_planejada,
        lote: value.lote,
        observacoes: value.observacoes,
      }, { transaction: t });

      for (const ing of formula.ingredientes) {
        const qtdPlanejada = parseFloat(ing.quantidade) * fator;
        const mp = await MateriaPrima.findOne({ where: { id: ing.materia_prima_id, empresa_id: req.empresa.id } });
        await OrdemProducaoInsumo.create({
          ordem_id: novaOrdem.id,
          materia_prima_id: ing.materia_prima_id,
          quantidade_planejada: qtdPlanejada,
          custo_unitario: mp.custo_medio,
        }, { transaction: t });
      }

      return novaOrdem;
    });

    res.status(201).json(await buscarOrdemCompleta(ordem.id, req.empresa.id));
  } catch (err) { next(err); }
};

exports.buscar = async (req, res, next) => {
  try {
    const ordem = await buscarOrdemCompleta(req.params.id, req.empresa.id);
    if (!ordem) return res.status(404).json({ error: 'Ordem não encontrada.' });
    res.json(ordem);
  } catch (err) { next(err); }
};

exports.iniciar = async (req, res, next) => {
  try {
    const ordem = await OrdemProducao.findOne({ where: { id: req.params.id, empresa_id: req.empresa.id } });
    if (!ordem) return res.status(404).json({ error: 'Ordem não encontrada.' });
    if (ordem.status !== 'planejada') return res.status(400).json({ error: 'Apenas ordens planejadas podem ser iniciadas.' });

    await ordem.update({ status: 'em_producao', data_inicio: new Date() });
    res.json({ status: ordem.status, data_inicio: ordem.data_inicio });
  } catch (err) { next(err); }
};

exports.concluir = async (req, res, next) => {
  try {
    const schemaConclusao = Joi.object({
      quantidade_produzida: Joi.number().positive().required(),
      turno: Joi.string().valid('A', 'B', 'C').default('A'),
      insumos_reais: Joi.array().items(Joi.object({
        insumo_id: Joi.number().integer().required(),
        quantidade_real_usada: Joi.number().positive().required(),
      })).optional(),
    });

    const { error, value } = schemaConclusao.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const ordem = await OrdemProducao.findOne({
      where: { id: req.params.id, empresa_id: req.empresa.id },
      include: [{ model: OrdemProducaoInsumo, as: 'insumos' }],
    });
    if (!ordem) return res.status(404).json({ error: 'Ordem não encontrada.' });
    if (ordem.status !== 'em_producao') return res.status(400).json({ error: 'Apenas ordens em produção podem ser concluídas.' });

    await sequelize.transaction(async (t) => {
      let custoTotal = 0;

      for (const insumo of ordem.insumos) {
        const qtdReal = value.insumos_reais
          ? (value.insumos_reais.find(i => i.insumo_id === insumo.id)?.quantidade_real_usada || parseFloat(insumo.quantidade_planejada))
          : parseFloat(insumo.quantidade_planejada);

        const mp = await MateriaPrima.findOne({ where: { id: insumo.materia_prima_id, empresa_id: req.empresa.id }, transaction: t });
        const novoSaldo = parseFloat(mp.estoque_atual) - qtdReal;

        await mp.update({ estoque_atual: novoSaldo }, { transaction: t });

        await MovimentacaoEstoque.create({
          empresa_id: req.empresa.id,
          materia_prima_id: mp.id,
          tipo: 'saida',
          quantidade: qtdReal,
          custo_unitario: insumo.custo_unitario,
          saldo_anterior: parseFloat(mp.estoque_atual),
          saldo_posterior: novoSaldo,
          origem_tipo: 'producao',
          origem_id: ordem.id,
          usuario_id: req.usuario.id,
          data_movimentacao: new Date(),
        }, { transaction: t });

        const subtotal = qtdReal * parseFloat(insumo.custo_unitario || 0);
        custoTotal += subtotal;
        await insumo.update({ quantidade_real_usada: qtdReal, subtotal }, { transaction: t });
      }

      const custoUnitario = value.quantidade_produzida > 0 ? custoTotal / value.quantidade_produzida : 0;

      const produto = await Produto.findOne({ where: { id: ordem.produto_id, empresa_id: req.empresa.id } });
      if (produto) {
        await produto.update({
          estoque_atual: parseFloat(produto.estoque_atual) + value.quantidade_produzida,
          preco_custo: custoUnitario,
        }, { transaction: t });

        const dataFabricacao = new Date();
        const numeroLote = await gerarNumeroLote(LoteProduto, value.turno || 'A', req.empresa.id, dataFabricacao);
        await LoteProduto.create({
          empresa_id: req.empresa.id,
          produto_id: produto.id,
          ordem_producao_id: ordem.id,
          numero_lote: numeroLote,
          quantidade: value.quantidade_produzida,
          data_fabricacao: dataFabricacao,
          custo_unitario: custoUnitario,
        }, { transaction: t });
      }

      await ordem.update({
        status: 'concluida',
        data_conclusao: new Date(),
        quantidade_produzida: value.quantidade_produzida,
        custo_total_calculado: custoTotal,
      }, { transaction: t });
    });

    res.json({ message: 'Ordem de produção concluída com sucesso.' });
  } catch (err) { next(err); }
};

exports.vincularProduto = async (req, res, next) => {
  try {
    const { produto_id } = req.body;
    if (!produto_id) return res.status(400).json({ error: 'produto_id é obrigatório.' });

    const ordem = await OrdemProducao.findOne({ where: { id: req.params.id, empresa_id: req.empresa.id } });
    if (!ordem) return res.status(404).json({ error: 'Ordem não encontrada.' });
    if (ordem.status === 'cancelada') {
      return res.status(400).json({ error: 'Ordem cancelada não pode ser alterada.' });
    }

    const produto = await Produto.findOne({ where: { id: produto_id, empresa_id: req.empresa.id } });
    if (!produto) return res.status(404).json({ error: 'Produto não encontrado.' });

    await ordem.update({ produto_id });
    res.json({ message: 'Produto vinculado com sucesso.', produto_id });
  } catch (err) { next(err); }
};

exports.corrigirProdutoConcluida = async (req, res, next) => {
  try {
    const { produto_id, turno } = req.body;
    if (!produto_id) return res.status(400).json({ error: 'produto_id é obrigatório.' });

    const ordem = await OrdemProducao.findOne({ where: { id: req.params.id, empresa_id: req.empresa.id } });
    if (!ordem) return res.status(404).json({ error: 'Ordem não encontrada.' });
    if (ordem.status !== 'concluida') {
      return res.status(400).json({ error: 'Este endpoint é apenas para ordens já concluídas.' });
    }
    if (ordem.produto_id) {
      return res.status(400).json({ error: 'Esta ordem já possui produto vinculado.' });
    }

    const produto = await Produto.findOne({ where: { id: produto_id, empresa_id: req.empresa.id } });
    if (!produto) return res.status(404).json({ error: 'Produto não encontrado.' });

    await sequelize.transaction(async (t) => {
      const custoUnitario = parseFloat(ordem.quantidade_produzida) > 0
        ? parseFloat(ordem.custo_total_calculado) / parseFloat(ordem.quantidade_produzida)
        : 0;

      await produto.update({
        estoque_atual: parseFloat(produto.estoque_atual) + parseFloat(ordem.quantidade_produzida),
        preco_custo: custoUnitario,
      }, { transaction: t });

      const dataFabricacao = ordem.data_conclusao ? new Date(ordem.data_conclusao) : new Date();
      const numeroLote = await gerarNumeroLote(LoteProduto, turno || 'A', req.empresa.id, dataFabricacao);
      await LoteProduto.create({
        empresa_id: req.empresa.id,
        produto_id,
        ordem_producao_id: ordem.id,
        numero_lote: numeroLote,
        quantidade: ordem.quantidade_produzida,
        data_fabricacao: dataFabricacao,
        custo_unitario: custoUnitario,
      }, { transaction: t });

      await ordem.update({ produto_id }, { transaction: t });
    });

    res.json({ message: 'Produto vinculado e estoque atualizado retroativamente.' });
  } catch (err) { next(err); }
};

exports.cancelar = async (req, res, next) => {
  try {
    const ordem = await OrdemProducao.findOne({ where: { id: req.params.id, empresa_id: req.empresa.id } });
    if (!ordem) return res.status(404).json({ error: 'Ordem não encontrada.' });
    if (['concluida', 'cancelada'].includes(ordem.status)) {
      return res.status(400).json({ error: 'Ordem já finalizada não pode ser cancelada.' });
    }

    await ordem.update({ status: 'cancelada' });
    res.json({ status: ordem.status });
  } catch (err) { next(err); }
};

async function buscarOrdemCompleta(id, empresaId) {
  return OrdemProducao.findOne({
    where: { id, empresa_id: empresaId },
    include: [
      { model: Formula, as: 'formula' },
      { model: Produto, as: 'produto', attributes: ['id', 'codigo', 'nome'] },
      { model: OrdemProducaoInsumo, as: 'insumos', include: [{ model: MateriaPrima, as: 'materiaPrima' }] },
    ],
  });
}
