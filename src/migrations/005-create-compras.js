module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('pedidos_compra', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      numero: { type: Sequelize.STRING(20), unique: true },
      fornecedor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'fornecedores', key: 'id' },
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
      },
      status: {
        type: Sequelize.ENUM('rascunho', 'enviado', 'parcial', 'recebido', 'cancelado'),
        defaultValue: 'rascunho',
      },
      data_pedido: { type: Sequelize.DATEONLY, allowNull: false },
      data_previsao: { type: Sequelize.DATEONLY },
      data_recebimento: { type: Sequelize.DATEONLY },
      valor_total: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      observacoes: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('pedidos_compra_itens', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      pedido_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'pedidos_compra', key: 'id' },
        onDelete: 'CASCADE',
      },
      materia_prima_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'materias_primas', key: 'id' },
      },
      quantidade_pedida: { type: Sequelize.DECIMAL(12, 3), allowNull: false },
      quantidade_recebida: { type: Sequelize.DECIMAL(12, 3), defaultValue: 0 },
      preco_unitario: { type: Sequelize.DECIMAL(10, 4), allowNull: false },
      subtotal: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('pedidos_compra_itens');
    await queryInterface.dropTable('pedidos_compra');
  },
};
