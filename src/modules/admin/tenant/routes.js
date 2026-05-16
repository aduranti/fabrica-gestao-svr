const express = require('express');
const router = express.Router();
const ctrl = require('./controller');

/**
 * @swagger
 * tags:
 *   name: Admin - Minha Conta
 *   description: Dados do próprio tenant (somente admin)
 */

/**
 * @swagger
 * /admin/tenant:
 *   get:
 *     tags: [Admin - Minha Conta]
 *     summary: Retorna dados do tenant autenticado
 *     description: Inclui plano e data de expiração do trial para exibir banner de aviso no frontend.
 *     responses:
 *       200:
 *         description: Dados do tenant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tenant'
 */
router.get('/', ctrl.meuTenant);

/**
 * @swagger
 * /admin/tenant:
 *   put:
 *     tags: [Admin - Minha Conta]
 *     summary: Atualiza dados do próprio tenant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome: { type: string }
 *               nome_fantasia: { type: string }
 *               email_contato: { type: string, format: email }
 *               telefone: { type: string }
 *               documento: { type: string }
 *     responses:
 *       200:
 *         description: Tenant atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tenant'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.put('/', ctrl.atualizar);

module.exports = router;
