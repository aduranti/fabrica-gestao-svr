const express = require('express');
const router = express.Router();
const controller = require('./controller');
const auth = require('../../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Fórmulas
 *   description: Receitas de produção com versionamento automático
 */

/**
 * @swagger
 * /formulas:
 *   get:
 *     tags: [Fórmulas]
 *     summary: Lista fórmulas
 *     parameters:
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *           enum: [sabonete, tintura, pomada]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [rascunho, ativa, inativa]
 *     responses:
 *       200:
 *         description: Lista de fórmulas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Formula'
 *   post:
 *     tags: [Fórmulas]
 *     summary: Cria fórmula com ingredientes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FormulaInput'
 *     responses:
 *       201:
 *         description: Fórmula criada (versão 1)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Formula'
 */
router.get('/', auth, controller.listar);
router.post('/', auth, controller.criar);

/**
 * @swagger
 * /formulas/{id}:
 *   get:
 *     tags: [Fórmulas]
 *     summary: Busca fórmula por ID (com ingredientes)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Fórmula completa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Formula'
 *       404:
 *         description: Não encontrada
 *   put:
 *     tags: [Fórmulas]
 *     summary: Atualiza fórmula (cria nova versão automaticamente)
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
 *             $ref: '#/components/schemas/FormulaInput'
 *     responses:
 *       200:
 *         description: Fórmula atualizada com nova versão
 */
router.get('/:id', auth, controller.buscar);
router.put('/:id', auth, controller.atualizar);

/**
 * @swagger
 * /formulas/{id}/status:
 *   patch:
 *     tags: [Fórmulas]
 *     summary: Altera status da fórmula
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [rascunho, ativa, inativa]
 *     responses:
 *       200:
 *         description: Status alterado
 */
router.patch('/:id/status', auth, controller.atualizarStatus);

/**
 * @swagger
 * /formulas/{id}/versoes:
 *   get:
 *     tags: [Fórmulas]
 *     summary: Lista histórico de versões da fórmula
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Histórico de versões com snapshots
 */
router.get('/:id/versoes', auth, controller.listarVersoes);

/**
 * @swagger
 * /formulas/{id}/custo:
 *   get:
 *     tags: [Fórmulas]
 *     summary: Calcula o custo de produção com base nos custos médios do estoque
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: quantidade
 *         schema:
 *           type: number
 *         description: Quantidade a produzir (padrão = rendimento da fórmula)
 *         example: 500
 *     responses:
 *       200:
 *         description: Detalhamento de custos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 formula:
 *                   type: string
 *                 quantidade_calculada:
 *                   type: number
 *                 custo_total:
 *                   type: number
 *                 custo_unitario:
 *                   type: number
 *                 ingredientes:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/:id/custo', auth, controller.calcularCusto);

module.exports = router;
