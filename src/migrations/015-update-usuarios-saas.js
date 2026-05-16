'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Adiciona empresa_id (nullable — super_admin fica NULL)
    await queryInterface.addColumn('usuarios', 'empresa_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
      references: { model: 'tenants', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      after: 'id',
    });

    // Expande o ENUM de perfil para incluir super_admin
    await queryInterface.changeColumn('usuarios', 'perfil', {
      type: Sequelize.ENUM('super_admin', 'admin', 'operador', 'comprador'),
      defaultValue: 'operador',
      allowNull: false,
    });

    // Remove unique simples em email
    await queryInterface.removeIndex('usuarios', ['email']).catch(() => {});

    // Adiciona unique composto (empresa_id, email)
    await queryInterface.addIndex('usuarios', ['empresa_id', 'email'], {
      unique: true,
      name: 'uq_usuarios_empresa_email',
    });

    // Adiciona ultimo_acesso
    await queryInterface.addColumn('usuarios', 'ultimo_acesso', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('usuarios', 'uq_usuarios_empresa_email');
    await queryInterface.addIndex('usuarios', ['email'], { unique: true });
    await queryInterface.changeColumn('usuarios', 'perfil', {
      type: Sequelize.ENUM('admin', 'operador', 'comprador'),
      defaultValue: 'operador',
    });
    await queryInterface.removeColumn('usuarios', 'ultimo_acesso');
    await queryInterface.removeColumn('usuarios', 'empresa_id');
  },
};
