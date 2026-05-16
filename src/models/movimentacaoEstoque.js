const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('MovimentacaoEstoque', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    empresa_id: { type: DataTypes.INTEGER, allowNull: true },
    materia_prima_id: { type: DataTypes.INTEGER, allowNull: false },
    tipo: {
      type: DataTypes.ENUM('entrada', 'saida', 'ajuste', 'perda'),
      allowNull: false,
    },
    quantidade: { type: DataTypes.DECIMAL(12, 3), allowNull: false },
    custo_unitario: { type: DataTypes.DECIMAL(10, 4) },
    saldo_anterior: { type: DataTypes.DECIMAL(12, 3) },
    saldo_posterior: { type: DataTypes.DECIMAL(12, 3) },
    origem_tipo: {
      type: DataTypes.ENUM('compra', 'producao', 'ajuste'),
    },
    origem_id: { type: DataTypes.INTEGER },
    usuario_id: { type: DataTypes.INTEGER },
    data_movimentacao: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    observacoes: { type: DataTypes.TEXT },
  }, {
    tableName: 'movimentacoes_estoque',
    updatedAt: false,
  });
};
