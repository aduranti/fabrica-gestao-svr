const express = require('express');
const router = express.Router();
const controller = require('./controller');
const auth = require('../../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Matérias-Primas
 *   description: Gerenciamento de matérias-primas, categorias e unidades de medida
 */

/**
 * @swagger
 * /materias-primas/categorias:
 *   get:
 *     tags: [Matérias-Primas]
 *     summary: Lista categorias de matérias-primas
 *     responses:
 *       200:
 *         description: Lista de categorias
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CategoriaMP'
 *   post:
 *     tags: [Matérias-Primas]
 *     summary: Cria categoria
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome]
 *             properties:
 *               nome:
 *                 type: string
 *                 example: Óleos Essenciais
 *               descricao:
 *                 type: string
 *     responses:
 *       201:
 *         description: Categoria criada
 */
router.get('/categorias', auth, controller.listarCategorias);
router.post('/categorias', auth, controller.criarCategoria);

/**
 * @swagger
 * /materias-primas/unidades:
 *   get:
 *     tags: [Matérias-Primas]
 *     summary: Lista unidades de medida
 *     responses:
 *       200:
 *         description: Lista de unidades
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UnidadeMedida'
 *   post:
 *     tags: [Matérias-Primas]
 *     summary: Cria unidade de medida
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, sigla]
 *             properties:
 *               nome:
 *                 type: string
 *                 example: Grama
 *               sigla:
 *                 type: string
 *                 example: g
 *     responses:
 *       201:
 *         description: Unidade criada
 */
router.get('/unidades', auth, controller.listarUnidades);
router.post('/unidades', auth, controller.criarUnidade);

/**
 * @swagger
 * /materias-primas/alertas-estoque:
 *   get:
 *     tags: [Matérias-Primas]
 *     summary: Lista matérias-primas com estoque abaixo do mínimo
 *     responses:
 *       200:
 *         description: Lista de matérias-primas em alerta
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MateriaPrima'
 */
router.get('/alertas-estoque', auth, controller.alertasEstoque);

/**
 * @swagger
 * /materias-primas:
 *   get:
 *     tags: [Matérias-Primas]
 *     summary: Lista matérias-primas
 *     parameters:
 *       - in: query
 *         name: ativo
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: categoria_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Busca por nome
 *     responses:
 *       200:
 *         description: Lista de matérias-primas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MateriaPrima'
 *   post:
 *     tags: [Matérias-Primas]
 *     summary: Cria matéria-prima
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MateriaPrimaInput'
 *     responses:
 *       201:
 *         description: Matéria-prima criada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MateriaPrima'
 */
router.get('/', auth, controller.listar);
router.post('/', auth, controller.criar);

/**
 * @swagger
 * /materias-primas/{id}:
 *   get:
 *     tags: [Matérias-Primas]
 *     summary: Busca matéria-prima por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Matéria-prima encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MateriaPrima'
 *       404:
 *         description: Não encontrada
 *   put:
 *     tags: [Matérias-Primas]
 *     summary: Atualiza matéria-prima
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
 *             $ref: '#/components/schemas/MateriaPrimaInput'
 *     responses:
 *       200:
 *         description: Atualizada com sucesso
 */
router.get('/:id', auth, controller.buscar);
router.put('/:id', auth, controller.atualizar);

/**
 * @swagger
 * /materias-primas/{id}/ativo:
 *   patch:
 *     tags: [Matérias-Primas]
 *     summary: Ativa ou desativa matéria-prima
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
 * /materias-primas/{id}/movimentacoes:
 *   get:
 *     tags: [Matérias-Primas]
 *     summary: Lista movimentações de estoque da matéria-prima
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Histórico de movimentações
 */
router.get('/:id/movimentacoes', auth, controller.movimentacoes);

/**
 * @swagger
 * /materias-primas/{id}/ajuste-estoque:
 *   post:
 *     tags: [Matérias-Primas]
 *     summary: Realiza ajuste manual de estoque
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
 *             required: [quantidade, observacoes]
 *             properties:
 *               quantidade:
 *                 type: number
 *                 description: Valor positivo para entrada, negativo para saída
 *                 example: -2.5
 *               observacoes:
 *                 type: string
 *                 example: Descarte por validade vencida
 *     responses:
 *       200:
 *         description: Ajuste realizado
 *       400:
 *         description: Ajuste resultaria em estoque negativo
 */
router.post('/:id/ajuste-estoque', auth, controller.ajusteEstoque);

module.exports = router;
