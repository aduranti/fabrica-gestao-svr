module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('unidades_medida', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      nome: { type: Sequelize.STRING(50), allowNull: false },
      sigla: { type: Sequelize.STRING(10), allowNull: false, unique: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('categorias_mp', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      nome: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      descricao: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('categorias_mp');
    await queryInterface.dropTable('unidades_medida');
  },
};
