module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('materias_primas', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      codigo: { type: Sequelize.STRING(30), unique: true },
      nome: { type: Sequelize.STRING(150), allowNull: false },
      descricao: { type: Sequelize.TEXT },
      categoria_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'categorias_mp', key: 'id' },
      },
      unidade_medida_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'unidades_medida', key: 'id' },
      },
      estoque_atual: { type: Sequelize.DECIMAL(12, 3), defaultValue: 0 },
      estoque_minimo: { type: Sequelize.DECIMAL(12, 3), defaultValue: 0 },
      estoque_maximo: { type: Sequelize.DECIMAL(12, 3), defaultValue: 0 },
      custo_medio: { type: Sequelize.DECIMAL(10, 4), defaultValue: 0 },
      ativo: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('materias_primas_fornecedores', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      materia_prima_id: {
        type: Sequelize.INTEGER,
        references: { model: 'materias_primas', key: 'id' },
        onDelete: 'CASCADE',
      },
      fornecedor_id: {
        type: Sequelize.INTEGER,
        references: { model: 'fornecedores', key: 'id' },
        onDelete: 'CASCADE',
      },
      preco_unitario: { type: Sequelize.DECIMAL(10, 4) },
      prazo_entrega_dias: { type: Sequelize.INTEGER },
      preferencial: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('movimentacoes_estoque', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      materia_prima_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'materias_primas', key: 'id' },
      },
      tipo: { type: Sequelize.ENUM('entrada', 'saida', 'ajuste', 'perda'), allowNull: false },
      quantidade: { type: Sequelize.DECIMAL(12, 3), allowNull: false },
      custo_unitario: { type: Sequelize.DECIMAL(10, 4) },
      saldo_anterior: { type: Sequelize.DECIMAL(12, 3) },
      saldo_posterior: { type: Sequelize.DECIMAL(12, 3) },
      origem_tipo: { type: Sequelize.ENUM('compra', 'producao', 'ajuste') },
      origem_id: { type: Sequelize.INTEGER },
      usuario_id: { type: Sequelize.INTEGER },
      data_movimentacao: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      observacoes: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, allowNull: false },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('movimentacoes_estoque');
    await queryInterface.dropTable('materias_primas_fornecedores');
    await queryInterface.dropTable('materias_primas');
  },
};
