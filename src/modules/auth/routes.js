const express = require('express');
const router = express.Router();
const controller = require('./controller');
const authMiddleware = require('../../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticação e sessão
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Realiza login
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/login', controller.login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Realiza logout
 *     responses:
 *       200:
 *         description: Logout realizado
 */
router.post('/logout', authMiddleware, controller.logout);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Retorna dados do usuário autenticado
 *     responses:
 *       200:
 *         description: Dados do usuário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 */
router.get('/me', authMiddleware, controller.me);

/**
 * @swagger
 * /auth/me/senha:
 *   put:
 *     tags: [Auth]
 *     summary: Altera a senha do usuário autenticado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [senha_atual, nova_senha]
 *             properties:
 *               senha_atual:
 *                 type: string
 *               nova_senha:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso
 *       400:
 *         description: Senha atual incorreta
 */
router.put('/me/senha', authMiddleware, controller.alterarSenha);

module.exports = router;
