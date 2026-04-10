'use strict';

module.exports = {
  up: async (queryInterface) => {
    const agora = new Date();
    await queryInterface.bulkInsert('categorias_mp', [
      {
        nome: 'Corrante Hidrossolúvel',
        descricao: 'Corrantes solúveis em água para formulações cosméticas',
        created_at: agora,
        updated_at: agora,
      },
      {
        nome: 'Base Glicerinada',
        descricao: 'Bases glicerinadas para sabonetes e cosméticos',
        created_at: agora,
        updated_at: agora,
      },
      {
        nome: 'Pigmento',
        descricao: 'Pigmentos para coloração de sabonetes e cosméticos',
        created_at: agora,
        updated_at: agora,
      },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('categorias_mp', {
      nome: ['Corrante Hidrossolúvel', 'Base Glicerinada', 'Pigmento'],
    });
  },
};
