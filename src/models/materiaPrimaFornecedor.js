const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('MateriaPrimaFornecedor', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    materia_prima_id: { type: DataTypes.INTEGER, allowNull: false },
    fornecedor_id: { type: DataTypes.INTEGER, allowNull: false },
    preco_unitario: { type: DataTypes.DECIMAL(10, 4) },
    prazo_entrega_dias: { type: DataTypes.INTEGER },
    preferencial: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, { tableName: 'materias_primas_fornecedores' });
};
