const express = require('express');
const router = express.Router();
const controller = require('./controller');
const auth = require('../../middlewares/auth');

router.get('/', auth, controller.listar);
router.post('/', auth, controller.criar);
router.get('/:id', auth, controller.buscar);
router.put('/:id', auth, controller.atualizar);
router.patch('/:id/ativo', auth, controller.toggleAtivo);
router.get('/:id/materias-primas', auth, controller.listarMateriasPrimas);

module.exports = router;
