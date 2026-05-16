const express = require('express');
const router = express.Router();
const ctrl = require('./controller');

// Rota pública — sem autenticação
router.post('/', ctrl.registrar);

module.exports = router;
