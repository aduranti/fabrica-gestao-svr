const express = require('express');
const router = express.Router();
const ctrl = require('./controller');

router.get('/', ctrl.listar);
router.get('/:id', ctrl.buscar);
router.post('/', ctrl.criar);
router.put('/:id', ctrl.atualizar);
router.patch('/:id/suspender', ctrl.suspender);

module.exports = router;
