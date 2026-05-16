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
  fator_conversao: Joi.number().positive().default(1),
  unidade_compra: Joi.string().max(30).allow('', null),
});

const schemaPedido = Joi.object({
  fornecedor_id: Joi.number().integer().required(),
  data_pedido: Joi.date().required(),
  data_previsao: Joi.date().allow(null),
  data_recebimento: Joi.date().allow(null),
  valor_frete: Joi.number().min(0).default(0),
  observacoes: Joi.string().allow('', null),
  itens: Joi.array().items(schemaItem).min(1).required(),
});

exports.listar = async (req, res, next) => {
  try {
    const { status, fornecedor_id } = req.query;
    const where = { empresa_id: req.empresa.id };
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
      const numero = await gerarNumero(PedidoCompra, 'PC', req.empresa.id);

      let valorTotal = 0;
      const itensData = value.itens.map(item => {
        const subtotal = item.quantidade_pedida * item.preco_unitario;
        valorTotal += subtotal;
        return { ...item, subtotal };
      });

      const novoPedido = await PedidoCompra.create({
        empresa_id: req.empresa.id,
        numero,
        fornecedor_id: value.fornecedor_id,
        usuario_id: req.usuario.id,
        data_pedido: value.data_pedido,
        data_previsao: value.data_previsao,
        observacoes: value.observacoes,
        valor_frete: value.valor_frete || 0,
        valor_total: valorTotal + (value.valor_frete || 0),
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
    const pedido = await PedidoCompra.findOne({
      where: { id: req.params.id, empresa_id: req.empresa.id },
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
    const pedido = await PedidoCompra.findOne({ where: { id: req.params.id, empresa_id: req.empresa.id } });
    if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado.' });

    if (!['rascunho', 'enviado'].includes(pedido.status)) {
      return res.status(400).json({ error: 'Apenas pedidos em rascunho ou enviado podem ser editados.' });
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
        valor_frete: value.valor_frete || 0,
        valor_total: valorTotal + (value.valor_frete || 0),
      }, { transaction: t });
    });

    res.json(await PedidoCompra.findByPk(pedido.id, { include: [{ model: PedidoCompraItem, as: 'itens' }] }));
  } catch (err) { next(err); }
};

exports.atualizarInfo = async (req, res, next) => {
  try {
    const schemaInfo = Joi.object({
      fornecedor_id: Joi.number().integer().required(),
      data_pedido: Joi.date().required(),
      data_previsao: Joi.date().allow(null),
      data_recebimento: Joi.date().allow(null),
      valor_frete: Joi.number().min(0).default(0),
      observacoes: Joi.string().allow('', null),
    });

    const { error, value } = schemaInfo.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const pedido = await PedidoCompra.findOne({ where: { id: req.params.id, empresa_id: req.empresa.id } });
    if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado.' });
    if (pedido.status === 'cancelado') {
      return res.status(400).json({ error: 'Pedido cancelado não pode ser alterado.' });
    }

    await pedido.update(value);
    res.json(pedido);
  } catch (err) { next(err); }
};

exports.corrigirItens = async (req, res, next) => {
  try {
    const { error, value } = Joi.object({
      itens: Joi.array().items(schemaItem).min(1).required(),
    }).validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const pedido = await PedidoCompra.findOne({
      where: { id: req.params.id, empresa_id: req.empresa.id },
      include: [{ model: PedidoCompraItem, as: 'itens' }],
    });
    if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado.' });
    if (pedido.status === 'cancelado') {
      return res.status(400).json({ error: 'Pedido cancelado não pode ser alterado.' });
    }

    await sequelize.transaction(async (t) => {
      const temRecebimento = ['parcial', 'recebido'].includes(pedido.status);

      if (temRecebimento) {
        for (const item of pedido.itens) {
          const qtdRecebida = parseFloat(item.quantidade_recebida) || 0;
          if (qtdRecebida <= 0) continue;

          const fatorConversao = parseFloat(item.fator_conversao) || 1;
          const qtdEstornar = qtdRecebida * fatorConversao;

          const materia = await MateriaPrima.findOne({ where: { id: item.materia_prima_id, empresa_id: req.empresa.id }, transaction: t });
          const saldoAnterior = parseFloat(materia.estoque_atual);
          const novoSaldo = saldoAnterior - qtdEstornar;

          let novoCustoMedio = parseFloat(materia.custo_medio);
          if (novoSaldo > 0) {
            const custoOriginal = parseFloat(item.preco_unitario) / fatorConversao;
            novoCustoMedio = Math.max(0,
              (parseFloat(materia.custo_medio) * saldoAnterior - custoOriginal * qtdEstornar) / novoSaldo
            );
          }

          await materia.update({
            estoque_atual: Math.max(0, novoSaldo),
            custo_medio: novoCustoMedio,
          }, { transaction: t });

          await MovimentacaoEstoque.create({
            empresa_id: req.empresa.id,
            materia_prima_id: materia.id,
            tipo: 'saida',
            quantidade: qtdEstornar,
            custo_unitario: parseFloat(item.preco_unitario) / fatorConversao,
            saldo_anterior: saldoAnterior,
            saldo_posterior: Math.max(0, novoSaldo),
            origem_tipo: 'ajuste',
            origem_id: pedido.id,
            usuario_id: req.usuario.id,
            data_movimentacao: new Date(),
            observacoes: `Estorno - correção do pedido ${pedido.numero}`,
          }, { transaction: t });
        }
      }

      await PedidoCompraItem.destroy({ where: { pedido_id: pedido.id }, transaction: t });

      let valorTotal = 0;
      for (const item of value.itens) {
        const subtotal = item.quantidade_pedida * item.preco_unitario;
        valorTotal += subtotal;
        await PedidoCompraItem.create({ pedido_id: pedido.id, ...item, subtotal }, { transaction: t });
      }

      await pedido.update({
        valor_total: valorTotal + parseFloat(pedido.valor_frete || 0),
        ...(temRecebimento ? { status: 'enviado', data_recebimento: null } : {}),
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

    const pedido = await PedidoCompra.findOne({ where: { id: req.params.id, empresa_id: req.empresa.id } });
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

    const pedido = await PedidoCompra.findOne({
      where: { id: req.params.id, empresa_id: req.empresa.id },
      include: [{ model: PedidoCompraItem, as: 'itens' }],
    });
    if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado.' });
    if (!['enviado', 'parcial'].includes(pedido.status)) {
      return res.status(400).json({ error: 'Apenas pedidos enviados ou parciais podem ser recebidos.' });
    }

    await sequelize.transaction(async (t) => {
      const valorFrete = parseFloat(pedido.valor_frete) || 0;
      const totalSubtotalRecebidos = value.itens.reduce((acc, recebimento) => {
        const item = pedido.itens.find(i => i.id === recebimento.item_id);
        return acc + (item ? parseFloat(item.subtotal) : 0);
      }, 0);

      for (const recebimento of value.itens) {
        const item = pedido.itens.find(i => i.id === recebimento.item_id);
        if (!item) continue;

        const preco = recebimento.preco_unitario || item.preco_unitario;
        const fatorConversao = parseFloat(item.fator_conversao) || 1;
        const qtdEstoque = recebimento.quantidade_recebida * fatorConversao;

        const freteItem = totalSubtotalRecebidos > 0
          ? valorFrete * (parseFloat(item.subtotal) / totalSubtotalRecebidos)
          : 0;
        const precoComFrete = (parseFloat(preco) + (freteItem / recebimento.quantidade_recebida)) / fatorConversao;

        await item.update({ quantidade_recebida: recebimento.quantidade_recebida, preco_unitario: preco }, { transaction: t });

        const materia = await MateriaPrima.findOne({ where: { id: item.materia_prima_id, empresa_id: req.empresa.id }, transaction: t });
        const novoCustoMedio = calcularCustoMedio(
          parseFloat(materia.estoque_atual),
          parseFloat(materia.custo_medio),
          qtdEstoque,
          precoComFrete
        );
        const novoSaldo = parseFloat(materia.estoque_atual) + qtdEstoque;

        await materia.update({ estoque_atual: novoSaldo, custo_medio: novoCustoMedio }, { transaction: t });

        await MovimentacaoEstoque.create({
          empresa_id: req.empresa.id,
          materia_prima_id: materia.id,
          tipo: 'entrada',
          quantidade: qtdEstoque,
          custo_unitario: precoComFrete,
          saldo_anterior: parseFloat(materia.estoque_atual),
          saldo_posterior: novoSaldo,
          origem_tipo: 'compra',
          origem_id: pedido.id,
          usuario_id: req.usuario.id,
          data_movimentacao: new Date(),
          observacoes: fatorConversao !== 1
            ? `${recebimento.quantidade_recebida} ${item.unidade_compra || 'un'} × ${fatorConversao} = ${qtdEstoque} em estoque`
            : null,
        }, { transaction: t });
      }

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
