module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('produtos', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      codigo: { type: Sequelize.STRING(30), unique: true },
      nome: { type: Sequelize.STRING(150), allowNull: false },
      formula_id: { type: Sequelize.INTEGER, references: { model: 'formulas', key: 'id' } },
      unidade_medida_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'unidades_medida', key: 'id' },
      },
      preco_custo: { type: Sequelize.DECIMAL(10, 4), defaultValue: 0 },
      preco_venda: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      estoque_atual: { type: Sequelize.DECIMAL(12, 3), defaultValue: 0 },
      estoque_minimo: { type: Sequelize.DECIMAL(12, 3), defaultValue: 0 },
      ativo: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('ordens_producao', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      numero: { type: Sequelize.STRING(20), unique: true },
      formula_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'formulas', key: 'id' },
      },
      usuario_responsavel_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
      },
      quantidade_planejada: { type: Sequelize.DECIMAL(10, 3), allowNull: false },
      quantidade_produzida: { type: Sequelize.DECIMAL(10, 3), defaultValue: 0 },
      status: {
        type: Sequelize.ENUM('planejada', 'em_producao', 'concluida', 'cancelada'),
        defaultValue: 'planejada',
      },
      data_planejada: { type: Sequelize.DATEONLY, allowNull: false },
      data_inicio: { type: Sequelize.DATE },
      data_conclusao: { type: Sequelize.DATE },
      custo_total_calculado: { type: Sequelize.DECIMAL(12, 4), defaultValue: 0 },
      lote: { type: Sequelize.STRING(50) },
      observacoes: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('ordens_producao_insumos', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      ordem_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'ordens_producao', key: 'id' },
        onDelete: 'CASCADE',
      },
      materia_prima_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'materias_primas', key: 'id' },
      },
      quantidade_planejada: { type: Sequelize.DECIMAL(12, 4), allowNull: false },
      quantidade_real_usada: { type: Sequelize.DECIMAL(12, 4), defaultValue: 0 },
      custo_unitario: { type: Sequelize.DECIMAL(10, 4) },
      subtotal: { type: Sequelize.DECIMAL(12, 4) },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('lotes_produtos', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      produto_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'produtos', key: 'id' },
      },
      ordem_producao_id: { type: Sequelize.INTEGER, references: { model: 'ordens_producao', key: 'id' } },
      numero_lote: { type: Sequelize.STRING(50), allowNull: false },
      quantidade: { type: Sequelize.DECIMAL(12, 3), allowNull: false },
      data_fabricacao: { type: Sequelize.DATEONLY, allowNull: false },
      data_validade: { type: Sequelize.DATEONLY },
      custo_unitario: { type: Sequelize.DECIMAL(10, 4) },
      status: {
        type: Sequelize.ENUM('disponivel', 'vendido', 'vencido', 'descartado'),
        defaultValue: 'disponivel',
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('lotes_produtos');
    await queryInterface.dropTable('ordens_producao_insumos');
    await queryInterface.dropTable('ordens_producao');
    await queryInterface.dropTable('produtos');
  },
};
