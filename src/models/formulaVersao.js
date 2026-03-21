const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('FormulaVersao', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    formula_id: { type: DataTypes.INTEGER, allowNull: false },
    versao: { type: DataTypes.INTEGER, allowNull: false },
    snapshot_json: { type: DataTypes.JSON, allowNull: false },
    usuario_id: { type: DataTypes.INTEGER },
    data_versao: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    motivo_alteracao: { type: DataTypes.STRING(255) },
  }, {
    tableName: 'formulas_versoes',
    updatedAt: false,
  });
};
