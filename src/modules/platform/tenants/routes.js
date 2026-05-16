const express = require('express');
const router = express.Router();
const ctrl = require('./controller');

/**
 * @swagger
 * tags:
 *   name: Platform - Tenants
 *   description: Gestão de tenants (somente super_admin)
 */

/**
 * @swagger
 * /platform/tenants:
 *   get:
 *     tags: [Platform - Tenants]
 *     summary: Lista todos os tenants
 *     parameters:
 *       - in: query
 *         name: ativo
 *         schema:
 *           type: boolean
 *         description: Filtra por ativos (true) ou inativos (false)
 *       - in: query
 *         name: plano
 *         schema:
 *           type: string
 *           enum: [trial, basico, profissional]
 *         description: Filtra por plano
 *     responses:
 *       200:
 *         description: Lista de tenants com seus usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tenant'
 *       403:
 *         description: Acesso negado — requer super_admin
 */
router.get('/', ctrl.listar);

/**
 * @swagger
 * /platform/tenants/{id}:
 *   get:
 *     tags: [Platform - Tenants]
 *     summary: Retorna detalhes de um tenant com seus usuários
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dados do tenant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tenant'
 *       404:
 *         description: Tenant não encontrado
 */
router.get('/:id', ctrl.buscar);

/**
 * @swagger
 * /platform/tenants:
 *   post:
 *     tags: [Platform - Tenants]
 *     summary: Cria um novo tenant manualmente (com usuário admin inicial)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TenantInput'
 *     responses:
 *       201:
 *         description: Tenant criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tenant'
 *       400:
 *         description: Dados inválidos ou admin inicial não informado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.post('/', ctrl.criar);

/**
 * @swagger
 * /platform/tenants/{id}:
 *   put:
 *     tags: [Platform - Tenants]
 *     summary: Atualiza dados de um tenant
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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
 *               plano:
 *                 type: string
 *                 enum: [trial, basico, profissional]
 *               trial_expira: { type: string, format: date, nullable: true }
 *     responses:
 *       200:
 *         description: Tenant atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tenant'
 *       404:
 *         description: Tenant não encontrado
 */
router.put('/:id', ctrl.atualizar);

/**
 * @swagger
 * /platform/tenants/{id}/suspender:
 *   patch:
 *     tags: [Platform - Tenants]
 *     summary: Ativa ou suspende um tenant (toggle)
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
 *         description: Tenant não encontrado
 */
router.patch('/:id/suspender', ctrl.suspender);

module.exports = router;
