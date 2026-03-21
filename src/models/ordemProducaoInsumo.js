const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('OrdemProducaoInsumo', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ordem_id: { type: DataTypes.INTEGER, allowNull: false },
    materia_prima_id: { type: DataTypes.INTEGER, allowNull: false },
    quantidade_planejada: { type: DataTypes.DECIMAL(12, 4), allowNull: false },
    quantidade_real_usada: { type: DataTypes.DECIMAL(12, 4), defaultValue: 0 },
    custo_unitario: { type: DataTypes.DECIMAL(10, 4) },
    subtotal: { type: DataTypes.DECIMAL(12, 4) },
  }, { tableName: 'ordens_producao_insumos' });
};
