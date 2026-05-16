'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tenants', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      tipo: { type: Sequelize.ENUM('pf', 'pj'), allowNull: false },
      documento: { type: Sequelize.STRING(20), allowNull: true },
      nome: { type: Sequelize.STRING(150), allowNull: false },
      nome_fantasia: { type: Sequelize.STRING(150), allowNull: true },
      email_contato: { type: Sequelize.STRING(150), allowNull: false },
      telefone: { type: Sequelize.STRING(20), allowNull: true },
      slug: { type: Sequelize.STRING(60), allowNull: false, unique: true },
      plano: {
        type: Sequelize.ENUM('trial', 'basico', 'profissional'),
        defaultValue: 'trial',
        allowNull: false,
      },
      ativo: { type: Sequelize.BOOLEAN, defaultValue: true },
      trial_expira: { type: Sequelize.DATEONLY, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tenants');
  },
};
