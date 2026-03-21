const express = require('express');
const router = express.Router();
const controller = require('./controller');
const auth = require('../../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Produtos
 *   description: Produtos acabados e controle de lotes
 */

/**
 * @swagger
 * /produtos/alertas-estoque:
 *   get:
 *     tags: [Produtos]
 *     summary: Lista produtos com estoque abaixo do mínimo
 *     responses:
 *       200:
 *         description: Produtos em alerta de estoque
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Produto'
 */
router.get('/alertas-estoque', auth, controller.alertasEstoque);

/**
 * @swagger
 * /produtos:
 *   get:
 *     tags: [Produtos]
 *     summary: Lista produtos acabados
 *     responses:
 *       200:
 *         description: Lista de produtos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Produto'
 *   post:
 *     tags: [Produtos]
 *     summary: Cria produto acabado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, unidade_medida_id]
 *             properties:
 *               codigo:
 *                 type: string
 *                 example: PROD-001
 *               nome:
 *                 type: string
 *                 example: Sabonete de Lavanda 100g
 *               formula_id:
 *                 type: integer
 *               unidade_medida_id:
 *                 type: integer
 *               preco_custo:
 *                 type: number
 *               preco_venda:
 *                 type: number
 *               estoque_minimo:
 *                 type: number
 *     responses:
 *       201:
 *         description: Produto criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Produto'
 */
router.get('/', auth, controller.listar);
router.post('/', auth, controller.criar);

/**
 * @swagger
 * /produtos/{id}:
 *   get:
 *     tags: [Produtos]
 *     summary: Busca produto por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Produto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Produto'
 *       404:
 *         description: Não encontrado
 *   put:
 *     tags: [Produtos]
 *     summary: Atualiza produto
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
 *             $ref: '#/components/schemas/Produto'
 *     responses:
 *       200:
 *         description: Produto atualizado
 */
router.get('/:id', auth, controller.buscar);
router.put('/:id', auth, controller.atualizar);

/**
 * @swagger
 * /produtos/{id}/lotes:
 *   get:
 *     tags: [Produtos]
 *     summary: Lista lotes do produto (rastreabilidade)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lotes de produção do produto
 */
router.get('/:id/lotes', auth, controller.listarLotes);

module.exports = router;
