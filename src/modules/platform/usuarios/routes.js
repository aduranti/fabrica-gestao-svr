const express = require('express');
const router = express.Router();
const ctrl = require('./controller');

router.get('/', ctrl.listar);
router.post('/', ctrl.criar);
router.patch('/:id/toggle-ativo', ctrl.desativar);

module.exports = router;
