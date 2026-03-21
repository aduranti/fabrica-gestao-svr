const express = require('express');
const router = express.Router();
const controller = require('./controller');
const auth = require('../../middlewares/auth');
const permit = require('../../middlewares/permissions');

router.get('/', auth, permit('admin'), controller.listar);
router.post('/', auth, permit('admin'), controller.criar);
router.get('/:id', auth, permit('admin'), controller.buscar);
router.put('/:id', auth, permit('admin'), controller.atualizar);
router.patch('/:id/ativo', auth, permit('admin'), controller.toggleAtivo);

module.exports = router;
