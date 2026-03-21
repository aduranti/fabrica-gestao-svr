module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('pedidos_compra', 'valor_frete', {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      after: 'valor_total',
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('pedidos_compra', 'valor_frete');
  },
};
