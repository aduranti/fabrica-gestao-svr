const express = require('express');
const router = express.Router();
const ctrl = require('./controller');

router.get('/', ctrl.meuTenant);
router.put('/', ctrl.atualizar);

module.exports = router;
