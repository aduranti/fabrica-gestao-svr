const Joi = require('joi');
const { Op } = require('sequelize');
const {
  PedidoCompra, PedidoCompraItem, MateriaPrima, Fornecedor,
  MovimentacaoEstoque, sequelize,
} = require('../../models');
const { gerarNumero } = require('../../utils/numerador');
const { calcularCustoMedio } = require('../../utils/custoMedio');

const schemaItem = Joi.object({
  materia_prima_id: Joi.number().integer().required(),
  quantidade_pedida: Joi.number().positive().required(),
  preco_unitario: Joi.number().positive().required(),
});

const schemaPedido = Joi.object({
  fornecedor_id: Joi.number().integer().required(),
  data_pedido: Joi.date().required(),
  data_previsao: Joi.date().allow(null),
  observacoes: Joi.string().allow('', null),
  itens: Joi.array().items(schemaItem).min(1).required(),
});

exports.listar = async (req, res, next) => {
  try {
    const { status, fornecedor_id } = req.query;
    const where = {};
    if (status) where.status = status;
    if (fornecedor_id) where.fornecedor_id = fornecedor_id;

    const pedidos = await PedidoCompra.findAll({
      where,
      include: [{ model: Fornecedor, as: 'fornecedor', attributes: ['id', 'razao_social'] }],
      order: [['data_pedido', 'DESC']],
    });
    res.json(pedidos);
  } catch (err) { next(err); }
};

exports.criar = async (req, res, next) => {
  try {
    const { error, value } = schemaPedido.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const pedido = await sequelize.transaction(async (t) => {
      const numero = await gerarNumero(PedidoCompra, 'PC');

      let valorTotal = 0;
      const itensData = value.itens.map(item => {
        const subtotal = item.quantidade_pedida * item.preco_unitario;
        valorTotal += subtotal;
        return { ...item, subtotal };
      });

      const novoPedido = await PedidoCompra.create({
        numero,
        fornecedor_id: value.fornecedor_id,
        usuario_id: req.usuario.id,
        data_pedido: value.data_pedido,
        data_previsao: value.data_previsao,
        observacoes: value.observacoes,
        valor_total: valorTotal,
      }, { transaction: t });

      for (const item of itensData) {
        await PedidoCompraItem.create({ pedido_id: novoPedido.id, ...item }, { transaction: t });
      }

      return novoPedido;
    });

    const pedidoCompleto = await PedidoCompra.findByPk(pedido.id, {
      include: [{ model: PedidoCompraItem, as: 'itens' }],
    });
    res.status(201).json(pedidoCompleto);
  } catch (err) { next(err); }
};

exports.buscar = async (req, res, next) => {
  try {
    const pedido = await PedidoCompra.findByPk(req.params.id, {
      include: [
        { model: Fornecedor, as: 'fornecedor' },
        { model: PedidoCompraItem, as: 'itens', include: [{ model: MateriaPrima, as: 'materiaPrima' }] },
      ],
    });
    if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado.' });
    res.json(pedido);
  } catch (err) { next(err); }
};

exports.atualizar = async (req, res, next) => {
  try {
    const pedido = await PedidoCompra.findByPk(req.params.id);
    if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado.' });

    if (!['rascunho'].includes(pedido.status)) {
      return res.status(400).json({ error: 'Apenas pedidos em rascunho podem ser editados.' });
    }

    const { error, value } = schemaPedido.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    await sequelize.transaction(async (t) => {
      await PedidoCompraItem.destroy({ where: { pedido_id: pedido.id }, transaction: t });

      let valorTotal = 0;
      for (const item of value.itens) {
        const subtotal = item.quantidade_pedida * item.preco_unitario;
        valorTotal += subtotal;
        await PedidoCompraItem.create({ pedido_id: pedido.id, ...item, subtotal }, { transaction: t });
      }

      await pedido.update({
        fornecedor_id: value.fornecedor_id,
        data_pedido: value.data_pedido,
        data_previsao: value.data_previsao,
        observacoes: value.observacoes,
        valor_total: valorTotal,
      }, { transaction: t });
    });

    res.json(await PedidoCompra.findByPk(pedido.id, { include: [{ model: PedidoCompraItem, as: 'itens' }] }));
  } catch (err) { next(err); }
};

exports.atualizarStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const statusValidos = ['enviado', 'cancelado'];
    if (!statusValidos.includes(status)) {
      return res.status(400).json({ error: `Status deve ser um de: ${statusValidos.join(', ')}` });
    }

    const pedido = await PedidoCompra.findByPk(req.params.id);
    if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado.' });

    if (pedido.status === 'cancelado' || pedido.status === 'recebido') {
      return res.status(400).json({ error: 'Pedido finalizado não pode ter status alterado.' });
    }

    await pedido.update({ status });
    res.json({ status: pedido.status });
  } catch (err) { next(err); }
};

exports.receberPedido = async (req, res, next) => {
  try {
    const schemaRecebimento = Joi.object({
      itens: Joi.array().items(Joi.object({
        item_id: Joi.number().integer().required(),
        quantidade_recebida: Joi.number().positive().required(),
        preco_unitario: Joi.number().positive(),
      })).min(1).required(),
    });

    const { error, value } = schemaRecebimento.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const pedido = await PedidoCompra.findByPk(req.params.id, {
      include: [{ model: PedidoCompraItem, as: 'itens' }],
    });
    if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado.' });
    if (!['enviado', 'parcial'].includes(pedido.status)) {
      return res.status(400).json({ error: 'Apenas pedidos enviados ou parciais podem ser recebidos.' });
    }

    await sequelize.transaction(async (t) => {
      for (const recebimento of value.itens) {
        const item = pedido.itens.find(i => i.id === recebimento.item_id);
        if (!item) continue;

        const preco = recebimento.preco_unitario || item.preco_unitario;
        await item.update({ quantidade_recebida: recebimento.quantidade_recebida, preco_unitario: preco }, { transaction: t });

        // Atualiza estoque com custo médio ponderado
        const materia = await MateriaPrima.findByPk(item.materia_prima_id, { transaction: t });
        const novoCustoMedio = calcularCustoMedio(
          parseFloat(materia.estoque_atual),
          parseFloat(materia.custo_medio),
          recebimento.quantidade_recebida,
          preco
        );
        const novoSaldo = parseFloat(materia.estoque_atual) + recebimento.quantidade_recebida;

        await materia.update({ estoque_atual: novoSaldo, custo_medio: novoCustoMedio }, { transaction: t });

        await MovimentacaoEstoque.create({
          materia_prima_id: materia.id,
          tipo: 'entrada',
          quantidade: recebimento.quantidade_recebida,
          custo_unitario: preco,
          saldo_anterior: parseFloat(materia.estoque_atual),
          saldo_posterior: novoSaldo,
          origem_tipo: 'compra',
          origem_id: pedido.id,
          usuario_id: req.usuario.id,
          data_movimentacao: new Date(),
        }, { transaction: t });
      }

      // Verifica se todos os itens foram recebidos
      const itensAtualizados = await PedidoCompraItem.findAll({ where: { pedido_id: pedido.id }, transaction: t });
      const todoRecebido = itensAtualizados.every(i => parseFloat(i.quantidade_recebida) >= parseFloat(i.quantidade_pedida));

      await pedido.update({
        status: todoRecebido ? 'recebido' : 'parcial',
        data_recebimento: todoRecebido ? new Date() : null,
      }, { transaction: t });
    });

    res.json({ message: 'Recebimento registrado com sucesso.' });
  } catch (err) { next(err); }
};
