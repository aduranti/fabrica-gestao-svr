module.exports = {
  up: async (queryInterface) => {
    const agora = new Date();
    await queryInterface.bulkInsert('categorias_mp', [
      {
        empresa_id: null,
        nome: 'Óleos Essenciais',
        descricao: 'Óleos essenciais aromáticos e terapêuticos',
        created_at: agora,
        updated_at: agora,
      },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('categorias_mp', { nome: 'Óleos Essenciais' }, {});
  },
};
