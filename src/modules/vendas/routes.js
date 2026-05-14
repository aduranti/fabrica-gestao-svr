const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const ctrl = require('./controller');

router.get('/', auth, ctrl.listar);
router.get('/:id', auth, ctrl.buscarPorId);
router.post('/', auth, ctrl.criar);
router.put('/:id', auth, ctrl.atualizar);
router.patch('/:id/confirmar', auth, ctrl.confirmar);
router.patch('/:id/cancelar', auth, ctrl.cancelar);
router.delete('/:id', auth, ctrl.excluir);

module.exports = router;
