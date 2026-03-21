module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('formulas', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      codigo: { type: Sequelize.STRING(30), unique: true },
      nome: { type: Sequelize.STRING(150), allowNull: false },
      descricao: { type: Sequelize.TEXT },
      categoria: { type: Sequelize.ENUM('sabonete', 'tintura', 'pomada'), allowNull: false },
      rendimento_quantidade: { type: Sequelize.DECIMAL(10, 3), allowNull: false },
      rendimento_unidade_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'unidades_medida', key: 'id' },
      },
      versao: { type: Sequelize.INTEGER, defaultValue: 1 },
      status: { type: Sequelize.ENUM('rascunho', 'ativa', 'inativa'), defaultValue: 'rascunho' },
      instrucoes_producao: { type: Sequelize.TEXT },
      observacoes: { type: Sequelize.TEXT },
      usuario_criacao_id: { type: Sequelize.INTEGER },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('formulas_ingredientes', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      formula_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'formulas', key: 'id' },
        onDelete: 'CASCADE',
      },
      materia_prima_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'materias_primas', key: 'id' },
      },
      quantidade: { type: Sequelize.DECIMAL(12, 4), allowNull: false },
      unidade_medida_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'unidades_medida', key: 'id' },
      },
      percentual: { type: Sequelize.DECIMAL(6, 3) },
      fase: {
        type: Sequelize.ENUM('aquosa', 'oleosa', 'esfriamento', 'final', 'unica'),
        defaultValue: 'unica',
      },
      ordem: { type: Sequelize.INTEGER, defaultValue: 0 },
      observacoes: { type: Sequelize.STRING(255) },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('formulas_versoes', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      formula_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'formulas', key: 'id' },
        onDelete: 'CASCADE',
      },
      versao: { type: Sequelize.INTEGER, allowNull: false },
      snapshot_json: { type: Sequelize.JSON, allowNull: false },
      usuario_id: { type: Sequelize.INTEGER },
      data_versao: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      motivo_alteracao: { type: Sequelize.STRING(255) },
      created_at: { type: Sequelize.DATE, allowNull: false },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('formulas_versoes');
    await queryInterface.dropTable('formulas_ingredientes');
    await queryInterface.dropTable('formulas');
  },
};
