'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vendas', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      numero: { type: Sequelize.STRING(20), allowNull: false, unique: true },
      cliente: { type: Sequelize.STRING(150), allowNull: true },
      data_venda: { type: Sequelize.DATEONLY, allowNull: false },
      status: {
        type: Sequelize.ENUM('rascunho', 'confirmada', 'cancelada'),
        defaultValue: 'rascunho',
        allowNull: false,
      },
      desconto: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      total: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      observacao: { type: Sequelize.TEXT, allowNull: true },
      usuario_id: {
        type: Sequelize.INTEGER,
        references: { model: 'usuarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true,
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('venda_itens', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      venda_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'vendas', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      produto_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'produtos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      quantidade: { type: Sequelize.DECIMAL(12, 3), allowNull: false },
      preco_unitario: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      subtotal: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('venda_itens');
    await queryInterface.dropTable('vendas');
  },
};
