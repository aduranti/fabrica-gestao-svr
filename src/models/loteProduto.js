const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('LoteProduto', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    empresa_id: { type: DataTypes.INTEGER, allowNull: true },
    produto_id: { type: DataTypes.INTEGER, allowNull: false },
    ordem_producao_id: { type: DataTypes.INTEGER },
    numero_lote: { type: DataTypes.STRING(50), allowNull: false },
    quantidade: { type: DataTypes.DECIMAL(12, 3), allowNull: false },
    data_fabricacao: { type: DataTypes.DATEONLY, allowNull: false },
    data_validade: { type: DataTypes.DATEONLY },
    custo_unitario: { type: DataTypes.DECIMAL(10, 4) },
    status: {
      type: DataTypes.ENUM('disponivel', 'vendido', 'vencido', 'descartado'),
      defaultValue: 'disponivel',
    },
  }, { tableName: 'lotes_produtos' });
};
