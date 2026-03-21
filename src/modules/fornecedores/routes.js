const express = require('express');
const router = express.Router();
const controller = require('./controller');
const auth = require('../../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Fornecedores
 *   description: Gerenciamento de fornecedores
 */

/**
 * @swagger
 * /fornecedores:
 *   get:
 *     tags: [Fornecedores]
 *     summary: Lista fornecedores
 *     parameters:
 *       - in: query
 *         name: ativo
 *         schema:
 *           type: boolean
 *         description: Filtrar por status ativo/inativo
 *     responses:
 *       200:
 *         description: Lista de fornecedores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Fornecedor'
 *   post:
 *     tags: [Fornecedores]
 *     summary: Cria fornecedor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FornecedorInput'
 *     responses:
 *       201:
 *         description: Fornecedor criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Fornecedor'
 */
router.get('/', auth, controller.listar);
router.post('/', auth, controller.criar);

/**
 * @swagger
 * /fornecedores/{id}:
 *   get:
 *     tags: [Fornecedores]
 *     summary: Busca fornecedor por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Fornecedor encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Fornecedor'
 *       404:
 *         description: Não encontrado
 *   put:
 *     tags: [Fornecedores]
 *     summary: Atualiza fornecedor
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
 *             $ref: '#/components/schemas/FornecedorInput'
 *     responses:
 *       200:
 *         description: Fornecedor atualizado
 */
router.get('/:id', auth, controller.buscar);
router.put('/:id', auth, controller.atualizar);

/**
 * @swagger
 * /fornecedores/{id}/ativo:
 *   patch:
 *     tags: [Fornecedores]
 *     summary: Ativa ou desativa fornecedor
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Status alterado
 */
router.patch('/:id/ativo', auth, controller.toggleAtivo);

/**
 * @swagger
 * /fornecedores/{id}/materias-primas:
 *   get:
 *     tags: [Fornecedores]
 *     summary: Lista matérias-primas fornecidas por este fornecedor
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de matérias-primas
 */
router.get('/:id/materias-primas', auth, controller.listarMateriasPrimas);

module.exports = router;
