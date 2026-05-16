const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Venda', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    empresa_id: { type: DataTypes.INTEGER, allowNull: true },
    numero: { type: DataTypes.STRING(20), allowNull: false },
    cliente_id: { type: DataTypes.INTEGER, allowNull: true },
    cliente: { type: DataTypes.STRING(150), allowNull: true },
    data_venda: { type: DataTypes.DATEONLY, allowNull: false },
    status: {
      type: DataTypes.ENUM('rascunho', 'confirmada', 'cancelada'),
      defaultValue: 'rascunho',
      allowNull: false,
    },
    desconto: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    total: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    observacao: { type: DataTypes.TEXT, allowNull: true },
    usuario_id: { type: DataTypes.INTEGER, allowNull: true },
  }, { tableName: 'vendas' });
};
