'use strict';

// Tabelas de primeiro nível que precisam de empresa_id.
// unidades_medida é global (compartilhada entre tenants) — não recebe empresa_id.
// categorias_mp recebe empresa_id nullable: NULL = categoria global do sistema.

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

    // ── categorias_mp ─────────────────────────────────────────────
    await queryInterface.addColumn('categorias_mp', 'empresa_id', fk);
    // Remove unique simples em nome, adiciona composto
    await queryInterface.removeIndex('categorias_mp', ['nome']).catch(() => {});
    await queryInterface.addIndex('categorias_mp', ['empresa_id', 'nome'], {
      unique: true, name: 'uq_categorias_empresa_nome',
    });

    // ── fornecedores ──────────────────────────────────────────────
    await queryInterface.addColumn('fornecedores', 'empresa_id', fk);
    await queryInterface.removeIndex('fornecedores', ['cnpj_cpf']).catch(() => {});
    await queryInterface.addIndex('fornecedores', ['empresa_id', 'cnpj_cpf'], {
      unique: true, name: 'uq_fornecedores_empresa_doc',
    });

    // ── materias_primas ───────────────────────────────────────────
    await queryInterface.addColumn('materias_primas', 'empresa_id', fk);
    await queryInterface.removeIndex('materias_primas', ['codigo']).catch(() => {});
    await queryInterface.addIndex('materias_primas', ['empresa_id', 'codigo'], {
      unique: true, name: 'uq_mp_empresa_codigo',
    });

    // ── pedidos_compra ────────────────────────────────────────────
    await queryInterface.addColumn('pedidos_compra', 'empresa_id', fk);
    await queryInterface.removeIndex('pedidos_compra', ['numero']).catch(() => {});
    await queryInterface.addIndex('pedidos_compra', ['empresa_id', 'numero'], {
      unique: true, name: 'uq_pedidos_empresa_numero',
    });

    // ── formulas ──────────────────────────────────────────────────
    await queryInterface.addColumn('formulas', 'empresa_id', fk);
    await queryInterface.removeIndex('formulas', ['codigo']).catch(() => {});
    await queryInterface.addIndex('formulas', ['empresa_id', 'codigo'], {
      unique: true, name: 'uq_formulas_empresa_codigo',
    });

    // ── ordens_producao ───────────────────────────────────────────
    await queryInterface.addColumn('ordens_producao', 'empresa_id', fk);
    await queryInterface.removeIndex('ordens_producao', ['numero']).catch(() => {});
    await queryInterface.addIndex('ordens_producao', ['empresa_id', 'numero'], {
      unique: true, name: 'uq_op_empresa_numero',
    });

    // ── produtos ──────────────────────────────────────────────────
    await queryInterface.addColumn('produtos', 'empresa_id', fk);
    await queryInterface.removeIndex('produtos', ['codigo']).catch(() => {});
    await queryInterface.addIndex('produtos', ['empresa_id', 'codigo'], {
      unique: true, name: 'uq_produtos_empresa_codigo',
    });

    // ── clientes ──────────────────────────────────────────────────
    await queryInterface.addColumn('clientes', 'empresa_id', fk);

    // ── vendas ────────────────────────────────────────────────────
    await queryInterface.addColumn('vendas', 'empresa_id', fk);
    await queryInterface.removeIndex('vendas', ['numero']).catch(() => {});
    await queryInterface.addIndex('vendas', ['empresa_id', 'numero'], {
      unique: true, name: 'uq_vendas_empresa_numero',
    });
  },

  async down(queryInterface) {
    for (const [table, idx] of [
      ['categorias_mp', 'uq_categorias_empresa_nome'],
      ['fornecedores', 'uq_fornecedores_empresa_doc'],
      ['materias_primas', 'uq_mp_empresa_codigo'],
      ['pedidos_compra', 'uq_pedidos_empresa_numero'],
      ['formulas', 'uq_formulas_empresa_codigo'],
      ['ordens_producao', 'uq_op_empresa_numero'],
      ['produtos', 'uq_produtos_empresa_codigo'],
      ['vendas', 'uq_vendas_empresa_numero'],
    ]) {
      await queryInterface.removeIndex(table, idx).catch(() => {});
      await queryInterface.removeColumn(table, 'empresa_id').catch(() => {});
    }
    await queryInterface.removeColumn('clientes', 'empresa_id').catch(() => {});
  },
};
