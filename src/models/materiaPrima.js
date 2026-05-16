const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('MateriaPrima', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    empresa_id: { type: DataTypes.INTEGER, allowNull: true },
    codigo: { type: DataTypes.STRING(30) },
    nome: { type: DataTypes.STRING(150), allowNull: false },
    descricao: { type: DataTypes.TEXT },
    categoria_id: { type: DataTypes.INTEGER, allowNull: false },
    unidade_medida_id: { type: DataTypes.INTEGER, allowNull: false },
    estoque_atual: { type: DataTypes.DECIMAL(12, 3), defaultValue: 0 },
    estoque_minimo: { type: DataTypes.DECIMAL(12, 3), defaultValue: 0 },
    estoque_maximo: { type: DataTypes.DECIMAL(12, 3), defaultValue: 0 },
    custo_medio: { type: DataTypes.DECIMAL(10, 4), defaultValue: 0 },
    ativo: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, { tableName: 'materias_primas' });
};
