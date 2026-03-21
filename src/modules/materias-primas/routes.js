const express = require('express');
const router = express.Router();
const controller = require('./controller');
const auth = require('../../middlewares/auth');

// Categorias
router.get('/categorias', auth, controller.listarCategorias);
router.post('/categorias', auth, controller.criarCategoria);

// Unidades de medida
router.get('/unidades', auth, controller.listarUnidades);
router.post('/unidades', auth, controller.criarUnidade);

// Matérias-primas
router.get('/', auth, controller.listar);
router.post('/', auth, controller.criar);
router.get('/alertas-estoque', auth, controller.alertasEstoque);
router.get('/:id', auth, controller.buscar);
router.put('/:id', auth, controller.atualizar);
router.patch('/:id/ativo', auth, controller.toggleAtivo);
router.get('/:id/movimentacoes', auth, controller.movimentacoes);
router.post('/:id/ajuste-estoque', auth, controller.ajusteEstoque);

module.exports = router;
