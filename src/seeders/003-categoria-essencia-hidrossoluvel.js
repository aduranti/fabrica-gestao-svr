'use strict';

module.exports = {
  up: async (queryInterface) => {
    const agora = new Date();
    await queryInterface.bulkInsert('categorias_mp', [{
      empresa_id: null,
      nome: 'Essência Hidrossolúvel',
      descricao: 'Essências solúveis em água para uso em formulações aquosas',
      created_at: agora,
      updated_at: agora,
    }]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('categorias_mp', { nome: 'Essência Hidrossolúvel' });
  },
};
