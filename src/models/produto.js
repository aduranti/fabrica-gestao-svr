const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Produto', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    empresa_id: { type: DataTypes.INTEGER, allowNull: true },
    codigo: { type: DataTypes.STRING(30) },
    nome: { type: DataTypes.STRING(150), allowNull: false },
    formula_id: { type: DataTypes.INTEGER },
    unidade_medida_id: { type: DataTypes.INTEGER, allowNull: false },
    preco_custo: { type: DataTypes.DECIMAL(10, 4), defaultValue: 0 },
    preco_venda: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    estoque_atual: { type: DataTypes.DECIMAL(12, 3), defaultValue: 0 },
    estoque_minimo: { type: DataTypes.DECIMAL(12, 3), defaultValue: 0 },
    ativo: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, { tableName: 'produtos' });
};
