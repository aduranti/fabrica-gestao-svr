const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface) => {
    const agora = new Date();

    // ── Super admin da plataforma (empresa_id = NULL) ─────────────
    await queryInterface.bulkInsert('usuarios', [{
      empresa_id: null,
      nome: 'Super Admin',
      email: 'superadmin@fabrica.com',
      senha_hash: await bcrypt.hash('admin123', 10),
      perfil: 'super_admin',
      ativo: true,
      ultimo_acesso: null,
      created_at: agora,
      updated_at: agora,
    }]);

    // ── Unidades de medida (globais — sem empresa_id) ─────────────
    await queryInterface.bulkInsert('unidades_medida', [
      { nome: 'Quilograma', sigla: 'kg', created_at: agora, updated_at: agora },
      { nome: 'Grama',      sigla: 'g',  created_at: agora, updated_at: agora },
      { nome: 'Litro',      sigla: 'L',  created_at: agora, updated_at: agora },
      { nome: 'Mililitro',  sigla: 'ml', created_at: agora, updated_at: agora },
      { nome: 'Unidade',    sigla: 'un', created_at: agora, updated_at: agora },
      { nome: 'Peça',       sigla: 'pc', created_at: agora, updated_at: agora },
    ]);

    // ── Categorias globais de MP (empresa_id = NULL) ──────────────
    // Ficam disponíveis para todos os tenants como opções padrão.
    await queryInterface.bulkInsert('categorias_mp', [
      { empresa_id: null, nome: 'Óleos Vegetais',  descricao: 'Óleos base para sabonetes e pomadas', created_at: agora, updated_at: agora },
      { empresa_id: null, nome: 'Hidrolatos',       descricao: 'Águas florais e hidrolatos',          created_at: agora, updated_at: agora },
      { empresa_id: null, nome: 'Ativos',           descricao: 'Ativos cosméticos e terapêuticos',    created_at: agora, updated_at: agora },
      { empresa_id: null, nome: 'Conservantes',     descricao: 'Conservantes e estabilizantes',       created_at: agora, updated_at: agora },
      { empresa_id: null, nome: 'Emulsificantes',   descricao: 'Emulsificantes e tensoativos',        created_at: agora, updated_at: agora },
      { empresa_id: null, nome: 'Ervas e Extratos', descricao: 'Ervas, extratos e tinturas base',     created_at: agora, updated_at: agora },
      { empresa_id: null, nome: 'Embalagens',       descricao: 'Frascos, potes e embalagens',         created_at: agora, updated_at: agora },
      { empresa_id: null, nome: 'Outros',           descricao: 'Demais insumos',                       created_at: agora, updated_at: agora },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('categorias_mp', null, {});
    await queryInterface.bulkDelete('unidades_medida', null, {});
    await queryInterface.bulkDelete('usuarios', null, {});
  },
};
