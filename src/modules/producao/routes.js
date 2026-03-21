const express = require('express');
const router = express.Router();
const controller = require('./controller');
const auth = require('../../middlewares/auth');

router.get('/', auth, controller.listar);
router.post('/', auth, controller.criar);
router.get('/:id', auth, controller.buscar);
router.patch('/:id/iniciar', auth, controller.iniciar);
router.patch('/:id/concluir', auth, controller.concluir);
router.patch('/:id/cancelar', auth, controller.cancelar);

module.exports = router;
