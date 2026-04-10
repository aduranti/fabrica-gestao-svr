const Joi = require('joi');
const { sequelize } = require('../../models');
const { QueryTypes } = require('sequelize');

exports.movimentacoesMateriasPrimas = async (req, res, next) => {
  try {
    const schema = Joi.object({
      materia_prima_id: Joi.number().integer().allow(null, ''),
      data_inicio: Joi.date().allow(null, ''),
      data_fim: Joi.date().allow(null, ''),
      tipo: Joi.string().valid('entrada', 'saida', 'ajuste', 'perda').allow(null, ''),
    });

    const { error, value } = schema.validate(req.query);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const condicoes = ['1=1'];
    const replacements = {};

    if (value.materia_prima_id) {
      condicoes.push('me.materia_prima_id = :materia_prima_id');
      replacements.materia_prima_id = value.materia_prima_id;
    }
    if (value.data_inicio) {
      condicoes.push('DATE(me.data_movimentacao) >= :data_inicio');
      replacements.data_inicio = value.data_inicio;
    }
    if (value.data_fim) {
      condicoes.push('DATE(me.data_movimentacao) <= :data_fim');
      replacements.data_fim = value.data_fim;
    }
    if (value.tipo) {
      condicoes.push('me.tipo = :tipo');
      replacements.tipo = value.tipo;
    }

    const where = condicoes.join(' AND ');

    const movimentacoes = await sequelize.query(`
      SELECT
        me.id,
        me.data_movimentacao,
        me.tipo,
        me.origem_tipo,
        me.origem_id,
        me.quantidade,
        me.custo_unitario,
        (me.quantidade * me.custo_unitario) AS valor_total,
        me.saldo_anterior,
        me.saldo_posterior,
        me.observacoes,
        mp.id   AS materia_prima_id,
        mp.nome AS materia_prima_nome,
        mp.codigo AS materia_prima_codigo,
        um.sigla AS unidade,
        CASE
          WHEN me.origem_tipo = 'compra'   THEN pc.numero
          WHEN me.origem_tipo = 'producao' THEN op.numero
          WHEN me.origem_tipo = 'ajuste'   THEN 'Ajuste manual'
          ELSE me.observacoes
        END AS documento_numero,
        CASE
          WHEN me.origem_tipo = 'compra' THEN fn.razao_social
          ELSE NULL
        END AS fornecedor,
        CASE
          WHEN me.origem_tipo = 'producao' THEN fm.nome
          ELSE NULL
        END AS formula_nome,
        u.nome AS usuario_nome
      FROM movimentacoes_estoque me
      JOIN materias_primas mp ON mp.id = me.materia_prima_id
      JOIN unidades_medida um ON um.id = mp.unidade_medida_id
      LEFT JOIN pedidos_compra pc  ON me.origem_tipo = 'compra'   AND pc.id = me.origem_id
      LEFT JOIN fornecedores fn    ON pc.fornecedor_id = fn.id
      LEFT JOIN ordens_producao op ON me.origem_tipo = 'producao' AND op.id = me.origem_id
      LEFT JOIN formulas fm        ON op.formula_id = fm.id
      LEFT JOIN usuarios u         ON u.id = me.usuario_id
      WHERE ${where}
      ORDER BY me.data_movimentacao DESC, me.id DESC
    `, { replacements, type: QueryTypes.SELECT });

    // Totais por tipo
    const totais = movimentacoes.reduce((acc, m) => {
      acc[m.tipo] = (acc[m.tipo] || 0) + parseFloat(m.quantidade);
      return acc;
    }, {});

    res.json({ movimentacoes, totais });
  } catch (err) { next(err); }
};

exports.listaMateriasPrimas = async (req, res, next) => {
  try {
    const mps = await sequelize.query(
      `SELECT id, CONCAT(COALESCE(codigo, ''), ' - ', nome) AS label FROM materias_primas ORDER BY nome`,
      { type: QueryTypes.SELECT }
    );
    res.json(mps);
  } catch (err) { next(err); }
};
