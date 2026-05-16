const express = require('express');
const router = express.Router();
const ctrl = require('./controller');

/**
 * @swagger
 * tags:
 *   name: Admin - Logs
 *   description: Logs de auditoria do próprio tenant (somente admin)
 */

/**
 * @swagger
 * /admin/logs:
 *   get:
 *     tags: [Admin - Logs]
 *     summary: Lista logs de auditoria do tenant autenticado
 *     parameters:
 *       - in: query
 *         name: acao
 *         schema:
 *           type: string
 *           enum: [login, logout, login_falhou, criar, atualizar, deletar, confirmar, cancelar, restaurar, exportar]
 *       - in: query
 *         name: entidade
 *         schema:
 *           type: string
 *         description: Nome da entidade (ex. Venda, MateriaPrima, Usuario)
 *       - in: query
 *         name: usuario_id
 *         schema:
 *           type: integer
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
 *           default: 50
 *           maximum: 200
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Logs paginados do tenant
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
