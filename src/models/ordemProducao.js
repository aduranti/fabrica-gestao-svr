const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('OrdemProducao', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    numero: { type: DataTypes.STRING(20), unique: true },
    formula_id: { type: DataTypes.INTEGER, allowNull: false },
    usuario_responsavel_id: { type: DataTypes.INTEGER, allowNull: false },
    quantidade_planejada: { type: DataTypes.DECIMAL(10, 3), allowNull: false },
    quantidade_produzida: { type: DataTypes.DECIMAL(10, 3), defaultValue: 0 },
    status: {
      type: DataTypes.ENUM('planejada', 'em_producao', 'concluida', 'cancelada'),
      defaultValue: 'planejada',
    },
    data_planejada: { type: DataTypes.DATEONLY, allowNull: false },
    data_inicio: { type: DataTypes.DATE },
    data_conclusao: { type: DataTypes.DATE },
    custo_total_calculado: { type: DataTypes.DECIMAL(12, 4), defaultValue: 0 },
    lote: { type: DataTypes.STRING(50) },
    observacoes: { type: DataTypes.TEXT },
  }, { tableName: 'ordens_producao' });
};
