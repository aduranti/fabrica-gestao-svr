const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('LogAuditoria', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    empresa_id: { type: DataTypes.INTEGER, allowNull: true },
    usuario_id: { type: DataTypes.INTEGER, allowNull: true },
    usuario_nome: { type: DataTypes.STRING(100), allowNull: true },
    acao: {
      type: DataTypes.ENUM(
        'login', 'logout', 'login_falhou',
        'criar', 'atualizar', 'deletar',
        'confirmar', 'cancelar', 'exportar', 'restaurar_backup'
      ),
      allowNull: false,
    },
    entidade: { type: DataTypes.STRING(60), allowNull: true },
    entidade_id: { type: DataTypes.INTEGER, allowNull: true },
    dados_anteriores: { type: DataTypes.JSON, allowNull: true },
    dados_novos: { type: DataTypes.JSON, allowNull: true },
    ip: { type: DataTypes.STRING(45), allowNull: true },
    user_agent: { type: DataTypes.STRING(255), allowNull: true },
  }, {
    tableName: 'logs_auditoria',
    updatedAt: false,
  });
};
