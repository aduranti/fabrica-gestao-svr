const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Fornecedor', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    razao_social: { type: DataTypes.STRING(150), allowNull: false },
    nome_fantasia: { type: DataTypes.STRING(150) },
    cnpj_cpf: { type: DataTypes.STRING(20), unique: true },
    telefone: { type: DataTypes.STRING(20) },
    email: { type: DataTypes.STRING(150) },
    site: { type: DataTypes.STRING(200) },
    endereco: { type: DataTypes.STRING(200) },
    cidade: { type: DataTypes.STRING(100) },
    estado: { type: DataTypes.STRING(2) },
    cep: { type: DataTypes.STRING(10) },
    ativo: { type: DataTypes.BOOLEAN, defaultValue: true },
    observacoes: { type: DataTypes.TEXT },
  }, { tableName: 'fornecedores' });
};
