'use strict';

// Tabelas de detalhe que precisam de empresa_id para consultas diretas
// (movimentacoes_estoque e lotes_produtos são consultadas em relatórios sem join por pai).
// Tabelas de itens (pedidos_compra_itens, venda_itens, etc.) são sempre consultadas
// via FK do pai e não precisam de empresa_id.

const FK = (Sequelize) => ({
  type: Sequelize.INTEGER,
  allowNull: true,
  defaultValue: null,
  references: { model: 'tenants', key: 'id' },
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE',
});

module.exports = {
  async up(queryInterface, Sequelize) {
    const fk = FK(Sequelize);
    await queryInterface.addColumn('movimentacoes_estoque', 'empresa_id', fk);
    await queryInterface.addColumn('lotes_produtos', 'empresa_id', fk);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('movimentacoes_estoque', 'empresa_id').catch(() => {});
    await queryInterface.removeColumn('lotes_produtos', 'empresa_id').catch(() => {});
  },
};
