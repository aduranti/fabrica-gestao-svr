const express = require('express');
const router = express.Router();
const ctrl = require('./controller');

/**
 * @swagger
 * tags:
 *   name: Platform - Logs
 *   description: Logs de auditoria globais (somente super_admin)
 */

/**
 * @swagger
 * /platform/logs:
 *   get:
 *     tags: [Platform - Logs]
 *     summary: Lista logs de auditoria de toda a plataforma
 *     parameters:
 *       - in: query
 *         name: empresa_id
 *         schema:
 *           type: integer
 *         description: Filtra por tenant
 *       - in: query
 *         name: usuario_id
 *         schema:
 *           type: integer
 *         description: Filtra por usuário
 *       - in: query
 *         name: acao
 *         schema:
 *           type: string
 *           enum: [login, logout, login_falhou, criar, atualizar, deletar, confirmar, cancelar, restaurar, exportar]
 *       - in: query
 *         name: entidade
 *         schema:
 *           type: string
 *         description: Nome da entidade (ex. Venda, MateriaPrima)
 *       - in: query
 *         name: data_inicio
 *         schema:
 *           type: string
 *           format: date
 *         example: "2026-05-01"
 *       - in: query
 *         name: data_fim
 *         schema:
 *           type: string
 *           format: date
 *         example: "2026-05-31"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *           maximum: 500
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Logs paginados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 logs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LogAuditoria'
 */
router.get('/', ctrl.listar);

module.exports = router;
