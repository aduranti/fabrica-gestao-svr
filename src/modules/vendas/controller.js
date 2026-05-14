const Joi = require('joi');
const { Venda, VendaItem, Produto, Usuario, Cliente, sequelize } = require('../../models');
const { gerarNumero } = require('../../utils/numerador');

const schemaItem = Joi.object({
  produto_id: Joi.number().integer().required(),
  quantidade: Joi.number().positive().required(),
  preco_unitario: Joi.number().min(0).required(),
});

const schemaVenda = Joi.object({
  cliente_id: Joi.number().integer().allow(null).optional(),
  cliente: Joi.string().max(150).allow('', null).optional(),
  data_venda: Joi.date().required(),
  desconto: Joi.number().min(0).default(0),
  observacao: Joi.string().allow('', null).optional(),
  itens: Joi.array().items(schemaItem).min(1).required(),
});

// Listar todas as vendas
exports.listar = async (req, res, next) => {
  try {
    const vendas = await Venda.findAll({
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'nome'] },
        { model: Cliente, as: 'clienteCadastrado', attributes: ['id', 'nome', 'cpf_cnpj', 'telefone'] },
        { model: VendaItem, as: 'itens', include: [{ model: Produto, as: 'produto', attributes: ['id', 'codigo', 'nome'] }] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(vendas);
  } catch (err) { next(err); }
};

// Buscar por ID
exports.buscarPorId = async (req, res, next) => {
  try {
    const venda = await buscarCompleta(req.params.id);
    if (!venda) return res.status(404).json({ error: 'Venda não encontrada.' });
    res.json(venda);
  } catch (err) { next(err); }
};

// Criar venda (status rascunho)
exports.criar = async (req, res, next) => {
  try {
    const { error, value } = schemaVenda.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const total = calcularTotal(value.itens, value.desconto);

    await sequelize.transaction(async (t) => {
      const numero = await gerarNumero(Venda, 'VD', 'numero');

      // Se vier cliente_id, busca o nome para preencher o campo cliente
      let nomeCliente = value.cliente || null;
      if (value.cliente_id) {
        const c = await Cliente.findByPk(value.cliente_id, { transaction: t });
        if (c) nomeCliente = c.nome;
      }

      const venda = await Venda.create({
        numero,
        cliente_id: value.cliente_id || null,
        cliente: nomeCliente,
        data_venda: value.data_venda,
        status: 'rascunho',
        desconto: value.desconto,
        total,
        observacao: value.observacao || null,
        usuario_id: req.usuario.id,
      }, { transaction: t });

      for (const item of value.itens) {
        await VendaItem.create({
          venda_id: venda.id,
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
          subtotal: item.quantidade * item.preco_unitario,
        }, { transaction: t });
      }
    });

    res.status(201).json({ message: 'Venda criada com sucesso.' });
  } catch (err) { next(err); }
};

// Atualizar venda (somente rascunho)
exports.atualizar = async (req, res, next) => {
  try {
    const venda = await Venda.findByPk(req.params.id, { include: [{ model: VendaItem, as: 'itens' }] });
    if (!venda) return res.status(404).json({ error: 'Venda não encontrada.' });
    if (venda.status !== 'rascunho') return res.status(400).json({ error: 'Apenas vendas em rascunho podem ser editadas.' });

    const { error, value } = schemaVenda.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const total = calcularTotal(value.itens, value.desconto);

    await sequelize.transaction(async (t) => {
      let nomeCliente = value.cliente || null;
      if (value.cliente_id) {
        const c = await Cliente.findByPk(value.cliente_id, { transaction: t });
        if (c) nomeCliente = c.nome;
      }

      await venda.update({
        cliente_id: value.cliente_id || null,
        cliente: nomeCliente,
        data_venda: value.data_venda,
        desconto: value.desconto,
        total,
        observacao: value.observacao || null,
      }, { transaction: t });

      await VendaItem.destroy({ where: { venda_id: venda.id }, transaction: t });

      for (const item of value.itens) {
        await VendaItem.create({
          venda_id: venda.id,
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
          subtotal: item.quantidade * item.preco_unitario,
        }, { transaction: t });
      }
    });

    res.json({ message: 'Venda atualizada com sucesso.' });
  } catch (err) { next(err); }
};

// Confirmar venda — dá baixa no estoque
exports.confirmar = async (req, res, next) => {
  try {
    const venda = await Venda.findByPk(req.params.id, {
      include: [{ model: VendaItem, as: 'itens' }],
    });
    if (!venda) return res.status(404).json({ error: 'Venda não encontrada.' });
    if (venda.status !== 'rascunho') return res.status(400).json({ error: 'Apenas vendas em rascunho podem ser confirmadas.' });

    await sequelize.transaction(async (t) => {
      for (const item of venda.itens) {
        const produto = await Produto.findByPk(item.produto_id, { transaction: t });
        if (!produto) throw new Error(`Produto ${item.produto_id} não encontrado.`);

        const qtd = parseFloat(item.quantidade);
        const saldoAtual = parseFloat(produto.estoque_atual);

        if (saldoAtual < qtd) {
          throw new Error(`Estoque insuficiente para "${produto.nome}". Disponível: ${saldoAtual}, solicitado: ${qtd}.`);
        }

        await produto.update({ estoque_atual: saldoAtual - qtd }, { transaction: t });
      }

      await venda.update({ status: 'confirmada' }, { transaction: t });
    });

    res.json({ message: 'Venda confirmada. Estoque atualizado.' });
  } catch (err) {
    if (err.message.includes('Estoque insuficiente')) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};

// Cancelar venda — devolve estoque se estava confirmada
exports.cancelar = async (req, res, next) => {
  try {
    const venda = await Venda.findByPk(req.params.id, {
      include: [{ model: VendaItem, as: 'itens' }],
    });
    if (!venda) return res.status(404).json({ error: 'Venda não encontrada.' });
    if (venda.status === 'cancelada') return res.status(400).json({ error: 'Venda já está cancelada.' });

    await sequelize.transaction(async (t) => {
      // Se já confirmada, devolve o estoque
      if (venda.status === 'confirmada') {
        for (const item of venda.itens) {
          const produto = await Produto.findByPk(item.produto_id, { transaction: t });
          if (produto) {
            await produto.update({
              estoque_atual: parseFloat(produto.estoque_atual) + parseFloat(item.quantidade),
            }, { transaction: t });
          }
        }
      }

      await venda.update({ status: 'cancelada' }, { transaction: t });
    });

    res.json({ message: 'Venda cancelada.' });
  } catch (err) { next(err); }
};

// Excluir venda (somente rascunho)
exports.excluir = async (req, res, next) => {
  try {
    const venda = await Venda.findByPk(req.params.id);
    if (!venda) return res.status(404).json({ error: 'Venda não encontrada.' });
    if (venda.status !== 'rascunho') return res.status(400).json({ error: 'Apenas rascunhos podem ser excluídos.' });
    await venda.destroy();
    res.json({ message: 'Venda excluída.' });
  } catch (err) { next(err); }
};

// Helpers
function calcularTotal(itens, desconto = 0) {
  const subtotal = itens.reduce((acc, i) => acc + i.quantidade * i.preco_unitario, 0);
  return Math.max(0, subtotal - parseFloat(desconto || 0));
}

async function buscarCompleta(id) {
  return Venda.findByPk(id, {
    include: [
      { model: Usuario, as: 'usuario', attributes: ['id', 'nome'] },
      { model: Cliente, as: 'clienteCadastrado', attributes: ['id', 'nome', 'cpf_cnpj', 'telefone', 'email', 'endereco'] },
      {
        model: VendaItem, as: 'itens',
        include: [{ model: Produto, as: 'produto', attributes: ['id', 'codigo', 'nome', 'unidade_medida_id'] }],
      },
    ],
  });
}
