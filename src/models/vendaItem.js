const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('VendaItem', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    venda_id: { type: DataTypes.INTEGER, allowNull: false },
    produto_id: { type: DataTypes.INTEGER, allowNull: false },
    quantidade: { type: DataTypes.DECIMAL(12, 3), allowNull: false },
    preco_unitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  }, { tableName: 'venda_itens' });
};
