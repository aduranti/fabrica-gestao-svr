const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('CategoriaMP', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    descricao: { type: DataTypes.TEXT },
  }, { tableName: 'categorias_mp' });
};
