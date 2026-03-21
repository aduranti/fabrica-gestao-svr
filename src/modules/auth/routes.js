const express = require('express');
const router = express.Router();
const controller = require('./controller');
const authMiddleware = require('../../middlewares/auth');

router.post('/login', controller.login);
router.post('/logout', authMiddleware, controller.logout);
router.get('/me', authMiddleware, controller.me);
router.put('/me/senha', authMiddleware, controller.alterarSenha);

module.exports = router;
