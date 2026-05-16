const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('CategoriaMP', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    empresa_id: { type: DataTypes.INTEGER, allowNull: true },
    nome: { type: DataTypes.STRING(100), allowNull: false },
    descricao: { type: DataTypes.TEXT },
  }, { tableName: 'categorias_mp' });
};
