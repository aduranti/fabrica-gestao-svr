const express = require('express');
const router = express.Router();
const controller = require('./controller');
const auth = require('../../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Produção
 *   description: Ordens de produção com controle de estoque automático
 */

/**
 * @swagger
 * /producao:
 *   get:
 *     tags: [Produção]
 *     summary: Lista ordens de produção
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [planejada, em_producao, concluida, cancelada]
 *     responses:
 *       200:
 *         description: Lista de ordens
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OrdemProducao'
 *   post:
 *     tags: [Produção]
 *     summary: Cria ordem de produção
 *     description: Valida estoque disponível e pré-calcula insumos necessários com base na fórmula.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrdemProducaoInput'
 *     responses:
 *       201:
 *         description: Ordem criada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrdemProducao'
 *       400:
 *         description: Estoque insuficiente (detalha o que falta)
 */
router.get('/', auth, controller.listar);
router.post('/', auth, controller.criar);

/**
 * @swagger
 * /producao/{id}:
 *   get:
 *     tags: [Produção]
 *     summary: Busca ordem de produção por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ordem completa com insumos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrdemProducao'
 */
router.get('/:id', auth, controller.buscar);

/**
 * @swagger
 * /producao/{id}/iniciar:
 *   patch:
 *     tags: [Produção]
 *     summary: Inicia produção (planejada → em_produção)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Produção iniciada
 */
router.patch('/:id/iniciar', auth, controller.iniciar);

/**
 * @swagger
 * /producao/{id}/concluir:
 *   patch:
 *     tags: [Produção]
 *     summary: Conclui produção — baixa estoque de MP e registra produto acabado
 *     description: |
 *       Ao concluir:
 *       - Dá baixa automática no estoque de todas as matérias-primas usadas
 *       - Calcula o custo total de produção
 *       - Atualiza o estoque do produto acabado
 *       - Cria um lote rastreável com número de lote e custo unitário
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
 *             required: [quantidade_produzida]
 *             properties:
 *               quantidade_produzida:
 *                 type: number
 *                 example: 480
 *               insumos_reais:
 *                 type: array
 *                 description: Quantidades reais usadas (opcional, usa planejado se omitido)
 *                 items:
 *                   type: object
 *                   properties:
 *                     insumo_id:
 *                       type: integer
 *                     quantidade_real_usada:
 *                       type: number
 *     responses:
 *       200:
 *         description: Produção concluída com sucesso
 */
router.patch('/:id/concluir', auth, controller.concluir);

/**
 * @swagger
 * /producao/{id}/cancelar:
 *   patch:
 *     tags: [Produção]
 *     summary: Cancela ordem de produção
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ordem cancelada
 */
router.patch('/:id/cancelar', auth, controller.cancelar);

module.exports = router;
