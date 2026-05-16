const express = require('express');
const router = express.Router();
const ctrl = require('./controller');

router.get('/', ctrl.listar);

module.exports = router;
