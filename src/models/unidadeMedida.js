const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('UnidadeMedida', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING(50), allowNull: false },
    sigla: { type: DataTypes.STRING(10), allowNull: false, unique: true },
  }, { tableName: 'unidades_medida' });
};
