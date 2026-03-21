const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface) => {
    const agora = new Date();

    // Usuário admin
    await queryInterface.bulkInsert('usuarios', [{
      nome: 'Administrador',
      email: 'admin@fabrica.com',
      senha_hash: await bcrypt.hash('admin123', 10),
      perfil: 'admin',
      ativo: true,
      created_at: agora,
      updated_at: agora,
    }]);

    // Unidades de medida
    await queryInterface.bulkInsert('unidades_medida', [
      { nome: 'Quilograma', sigla: 'kg', created_at: agora, updated_at: agora },
      { nome: 'Grama', sigla: 'g', created_at: agora, updated_at: agora },
      { nome: 'Litro', sigla: 'L', created_at: agora, updated_at: agora },
      { nome: 'Mililitro', sigla: 'ml', created_at: agora, updated_at: agora },
      { nome: 'Unidade', sigla: 'un', created_at: agora, updated_at: agora },
      { nome: 'Peça', sigla: 'pc', created_at: agora, updated_at: agora },
    ]);

    // Categorias de matérias-primas
    await queryInterface.bulkInsert('categorias_mp', [
      { nome: 'Óleos Vegetais', descricao: 'Óleos base para sabonetes e pomadas', created_at: agora, updated_at: agora },
      { nome: 'Hidrolatos', descricao: 'Águas florais e hidrolatos', created_at: agora, updated_at: agora },
      { nome: 'Ativos', descricao: 'Ativos cosméticos e terapêuticos', created_at: agora, updated_at: agora },
      { nome: 'Conservantes', descricao: 'Conservantes e estabilizantes', created_at: agora, updated_at: agora },
      { nome: 'Emulsificantes', descricao: 'Emulsificantes e tensoativos', created_at: agora, updated_at: agora },
      { nome: 'Ervas e Extratos', descricao: 'Ervas, extratos e tinturas base', created_at: agora, updated_at: agora },
      { nome: 'Embalagens', descricao: 'Frascos, potes e embalagens', created_at: agora, updated_at: agora },
      { nome: 'Outros', descricao: 'Demais insumos', created_at: agora, updated_at: agora },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('categorias_mp', null, {});
    await queryInterface.bulkDelete('unidades_medida', null, {});
    await queryInterface.bulkDelete('usuarios', null, {});
  },
};
