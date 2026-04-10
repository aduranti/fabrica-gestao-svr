const express = require('express');
const router = express.Router();
const controller = require('./controller');
const auth = require('../../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Compras
 *   description: Pedidos de compra de matérias-primas
 */

/**
 * @swagger
 * /compras:
 *   get:
 *     tags: [Compras]
 *     summary: Lista pedidos de compra
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [rascunho, enviado, parcial, recebido, cancelado]
 *       - in: query
 *         name: fornecedor_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de pedidos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PedidoCompra'
 *   post:
 *     tags: [Compras]
 *     summary: Cria pedido de compra
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PedidoCompraInput'
 *     responses:
 *       201:
 *         description: Pedido criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PedidoCompra'
 */
router.get('/', auth, controller.listar);
router.post('/', auth, controller.criar);

/**
 * @swagger
 * /compras/{id}:
 *   get:
 *     tags: [Compras]
 *     summary: Busca pedido por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pedido encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PedidoCompra'
 *       404:
 *         description: Não encontrado
 *   put:
 *     tags: [Compras]
 *     summary: Atualiza pedido (somente rascunho)
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
 *             $ref: '#/components/schemas/PedidoCompraInput'
 *     responses:
 *       200:
 *         description: Pedido atualizado
 */
router.get('/:id', auth, controller.buscar);
router.put('/:id', auth, controller.atualizar);
router.patch('/:id/info', auth, controller.atualizarInfo);
router.put('/:id/corrigir-itens', auth, controller.corrigirItens);

/**
 * @swagger
 * /compras/{id}/status:
 *   patch:
 *     tags: [Compras]
 *     summary: Atualiza status do pedido (enviado ou cancelado)
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
 *                 enum: [enviado, cancelado]
 *     responses:
 *       200:
 *         description: Status atualizado
 */
router.patch('/:id/status', auth, controller.atualizarStatus);

/**
 * @swagger
 * /compras/{id}/receber:
 *   post:
 *     tags: [Compras]
 *     summary: Registra recebimento do pedido e atualiza estoque automaticamente
 *     description: Ao receber, o estoque das matérias-primas é atualizado com custo médio ponderado.
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
 *             required: [itens]
 *             properties:
 *               itens:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [item_id, quantidade_recebida]
 *                   properties:
 *                     item_id:
 *                       type: integer
 *                     quantidade_recebida:
 *                       type: number
 *                     preco_unitario:
 *                       type: number
 *                       description: Opcional, usa o preço do pedido se omitido
 *     responses:
 *       200:
 *         description: Recebimento registrado com sucesso
 */
router.post('/:id/receber', auth, controller.receberPedido);

module.exports = router;
