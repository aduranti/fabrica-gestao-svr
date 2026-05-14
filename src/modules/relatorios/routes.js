const express = require('express');
const router = express.Router();
const controller = require('./controller');
const auth = require('../../middlewares/auth');

router.get('/movimentacoes-mp', auth, controller.movimentacoesMateriasPrimas);
router.get('/materias-primas-lista', auth, controller.listaMateriasPrimas);
router.get('/produtos-acabados', auth, controller.produtosAcabados);

module.exports = router;
