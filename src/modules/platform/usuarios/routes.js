const express = require('express');
const router = express.Router();
const ctrl = require('./controller');

/**
 * @swagger
 * tags:
 *   name: Platform - Usuários
 *   description: Visão global de usuários (somente super_admin)
 */

/**
 * @swagger
 * /platform/usuarios:
 *   get:
 *     tags: [Platform - Usuários]
 *     summary: Lista todos os usuários da plataforma
 *     parameters:
 *       - in: query
 *         name: empresa_id
 *         schema:
 *           type: integer
 *         description: Filtra por tenant
 *       - in: query
 *         name: perfil
 *         schema:
 *           type: string
 *           enum: [super_admin, admin, operador, comprador]
 *         description: Filtra por perfil
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 */
router.get('/', ctrl.listar);

/**
 * @swagger
 * /platform/usuarios:
 *   post:
 *     tags: [Platform - Usuários]
 *     summary: Cria um usuário (qualquer perfil, incluindo super_admin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, email, senha, perfil]
 *             properties:
 *               nome: { type: string, example: João Silva }
 *               email: { type: string, format: email }
 *               senha: { type: string, minLength: 6 }
 *               perfil:
 *                 type: string
 *                 enum: [super_admin, admin, operador, comprador]
 *               empresa_id:
 *                 type: integer
 *                 nullable: true
 *                 description: Obrigatório para perfis que não sejam super_admin
 *     responses:
 *       201:
 *         description: Usuário criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.post('/', ctrl.criar);

/**
 * @swagger
 * /platform/usuarios/{id}/toggle-ativo:
 *   patch:
 *     tags: [Platform - Usuários]
 *     summary: Ativa ou desativa um usuário (toggle)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Status atual após o toggle
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ativo:
 *                   type: boolean
 *       404:
 *         description: Usuário não encontrado
 */
router.patch('/:id/toggle-ativo', ctrl.desativar);

module.exports = router;
