const express = require('express');
const router = express.Router();
const controller = require('./controller');
const auth = require('../../middlewares/auth');

router.get('/', auth, controller.listar);
router.post('/', auth, controller.criar);
router.get('/:id', auth, controller.buscar);
router.put('/:id', auth, controller.atualizar);
router.patch('/:id/status', auth, controller.atualizarStatus);
router.get('/:id/versoes', auth, controller.listarVersoes);
router.get('/:id/custo', auth, controller.calcularCusto);

module.exports = router;
