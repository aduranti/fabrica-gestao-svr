const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('PedidoCompra', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    numero: { type: DataTypes.STRING(20), unique: true },
    fornecedor_id: { type: DataTypes.INTEGER, allowNull: false },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    status: {
      type: DataTypes.ENUM('rascunho', 'enviado', 'parcial', 'recebido', 'cancelado'),
      defaultValue: 'rascunho',
    },
    data_pedido: { type: DataTypes.DATEONLY, allowNull: false },
    data_previsao: { type: DataTypes.DATEONLY },
    data_recebimento: { type: DataTypes.DATEONLY },
    valor_total: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    observacoes: { type: DataTypes.TEXT },
  }, { tableName: 'pedidos_compra' });
};
