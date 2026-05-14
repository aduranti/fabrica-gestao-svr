'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('clientes', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      nome: { type: Sequelize.STRING(150), allowNull: false },
      cpf_cnpj: { type: Sequelize.STRING(20), allowNull: true },
      telefone: { type: Sequelize.STRING(20), allowNull: true },
      email: { type: Sequelize.STRING(100), allowNull: true },
      endereco: { type: Sequelize.STRING(250), allowNull: true },
      observacao: { type: Sequelize.TEXT, allowNull: true },
      ativo: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addColumn('vendas', 'cliente_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'clientes', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      after: 'numero',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('vendas', 'cliente_id');
    await queryInterface.dropTable('clientes');
  },
};
