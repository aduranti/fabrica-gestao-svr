'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('ordens_producao', 'produto_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: 'formula_id',
      references: { model: 'produtos', key: 'id' },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('ordens_producao', 'produto_id');
  },
};
