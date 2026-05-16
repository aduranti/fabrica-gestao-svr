const express = require('express');
const router = express.Router();
const ctrl = require('./controller');

router.get('/', ctrl.listar);
router.post('/', ctrl.criar);
router.put('/:id', ctrl.atualizar);
router.patch('/:id/senha', ctrl.redefinirSenha);
router.patch('/:id/toggle-ativo', ctrl.toggleAtivo);

module.exports = router;
