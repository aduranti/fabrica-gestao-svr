'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('logs_auditoria', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      empresa_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'tenants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'usuarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      usuario_nome: { type: Sequelize.STRING(100), allowNull: true },
      acao: {
        type: Sequelize.ENUM(
          'login', 'logout', 'login_falhou',
          'criar', 'atualizar', 'deletar',
          'confirmar', 'cancelar', 'exportar', 'restaurar_backup'
        ),
        allowNull: false,
      },
      entidade: { type: Sequelize.STRING(60), allowNull: true },
      entidade_id: { type: Sequelize.INTEGER, allowNull: true },
      dados_anteriores: { type: Sequelize.JSON, allowNull: true },
      dados_novos: { type: Sequelize.JSON, allowNull: true },
      ip: { type: Sequelize.STRING(45), allowNull: true },
      user_agent: { type: Sequelize.STRING(255), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('logs_auditoria', ['empresa_id', 'created_at'], { name: 'idx_log_empresa_data' });
    await queryInterface.addIndex('logs_auditoria', ['usuario_id'], { name: 'idx_log_usuario' });
    await queryInterface.addIndex('logs_auditoria', ['entidade', 'entidade_id'], { name: 'idx_log_entidade' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('logs_auditoria');
  },
};
