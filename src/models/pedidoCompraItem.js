const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('PedidoCompraItem', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    pedido_id: { type: DataTypes.INTEGER, allowNull: false },
    materia_prima_id: { type: DataTypes.INTEGER, allowNull: false },
    quantidade_pedida: { type: DataTypes.DECIMAL(12, 3), allowNull: false },
    quantidade_recebida: { type: DataTypes.DECIMAL(12, 3), defaultValue: 0 },
    preco_unitario: { type: DataTypes.DECIMAL(10, 4), allowNull: false },
    subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  }, { tableName: 'pedidos_compra_itens' });
};
