const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Cliente', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING(150), allowNull: false },
    cpf_cnpj: { type: DataTypes.STRING(20), allowNull: true },
    telefone: { type: DataTypes.STRING(20), allowNull: true },
    email: { type: DataTypes.STRING(100), allowNull: true },
    endereco: { type: DataTypes.STRING(250), allowNull: true },
    observacao: { type: DataTypes.TEXT, allowNull: true },
    ativo: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, { tableName: 'clientes' });
};
