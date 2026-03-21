module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('fornecedores', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      razao_social: { type: Sequelize.STRING(150), allowNull: false },
      nome_fantasia: { type: Sequelize.STRING(150) },
      cnpj_cpf: { type: Sequelize.STRING(20), unique: true },
      telefone: { type: Sequelize.STRING(20) },
      email: { type: Sequelize.STRING(150) },
      endereco: { type: Sequelize.STRING(200) },
      cidade: { type: Sequelize.STRING(100) },
      estado: { type: Sequelize.STRING(2) },
      cep: { type: Sequelize.STRING(10) },
      ativo: { type: Sequelize.BOOLEAN, defaultValue: true },
      observacoes: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('fornecedores');
  },
};
