module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('pedidos_compra_itens', 'fator_conversao', {
      type: Sequelize.DECIMAL(10, 4),
      allowNull: false,
      defaultValue: 1,
      after: 'preco_unitario',
      comment: 'Quantas unidades de estoque equivalem a 1 unidade de compra. Ex: 1 unidade = 100ml => fator = 100',
    });
    await queryInterface.addColumn('pedidos_compra_itens', 'unidade_compra', {
      type: Sequelize.STRING(30),
      allowNull: true,
      after: 'fator_conversao',
      comment: 'Descrição da unidade de compra. Ex: frasco, caixa, kg',
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('pedidos_compra_itens', 'unidade_compra');
    await queryInterface.removeColumn('pedidos_compra_itens', 'fator_conversao');
  },
};
