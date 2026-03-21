module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('fornecedores', 'site', {
      type: Sequelize.STRING(200),
      allowNull: true,
      after: 'email',
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('fornecedores', 'site');
  },
};
