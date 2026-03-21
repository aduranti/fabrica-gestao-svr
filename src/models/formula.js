const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Formula', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    codigo: { type: DataTypes.STRING(30), unique: true },
    nome: { type: DataTypes.STRING(150), allowNull: false },
    descricao: { type: DataTypes.TEXT },
    categoria: {
      type: DataTypes.ENUM('sabonete', 'tintura', 'pomada'),
      allowNull: false,
    },
    rendimento_quantidade: { type: DataTypes.DECIMAL(10, 3), allowNull: false },
    rendimento_unidade_id: { type: DataTypes.INTEGER, allowNull: false },
    versao: { type: DataTypes.INTEGER, defaultValue: 1 },
    status: {
      type: DataTypes.ENUM('rascunho', 'ativa', 'inativa'),
      defaultValue: 'rascunho',
    },
    instrucoes_producao: { type: DataTypes.TEXT },
    observacoes: { type: DataTypes.TEXT },
    usuario_criacao_id: { type: DataTypes.INTEGER },
  }, { tableName: 'formulas' });
};
