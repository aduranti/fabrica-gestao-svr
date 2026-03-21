const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('FormulaIngrediente', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    formula_id: { type: DataTypes.INTEGER, allowNull: false },
    materia_prima_id: { type: DataTypes.INTEGER, allowNull: false },
    quantidade: { type: DataTypes.DECIMAL(12, 4), allowNull: false },
    unidade_medida_id: { type: DataTypes.INTEGER, allowNull: false },
    percentual: { type: DataTypes.DECIMAL(6, 3) },
    fase: {
      type: DataTypes.ENUM('aquosa', 'oleosa', 'esfriamento', 'final', 'unica'),
      defaultValue: 'unica',
    },
    ordem: { type: DataTypes.INTEGER, defaultValue: 0 },
    observacoes: { type: DataTypes.STRING(255) },
  }, { tableName: 'formulas_ingredientes' });
};
