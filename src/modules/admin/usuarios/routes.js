const express = require('express');
const router = express.Router();
const ctrl = require('./controller');

/**
 * @swagger
 * tags:
 *   name: Admin - Usuários
 *   description: Gestão de usuários do próprio tenant (somente admin)
 */

/**
 * @swagger
 * /admin/usuarios:
 *   get:
 *     tags: [Admin - Usuários]
 *     summary: Lista usuários do tenant autenticado
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 */
router.get('/', ctrl.listar);

/**
 * @swagger
 * /admin/usuarios:
 *   post:
 *     tags: [Admin - Usuários]
 *     summary: Cria um novo usuário no tenant
 *     description: "Perfis disponíveis: admin, operador, comprador. Não é possível criar super_admin por aqui."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioInput'
 *     responses:
 *       201:
 *         description: Usuário criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       409:
 *         description: E-mail já cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.post('/', ctrl.criar);

/**
 * @swagger
 * /admin/usuarios/{id}:
 *   put:
 *     tags: [Admin - Usuários]
 *     summary: Atualiza nome, e-mail ou perfil de um usuário
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
 *               email: { type: string, format: email }
 *               perfil:
 *                 type: string
 *                 enum: [admin, operador, comprador]
 *               ativo: { type: boolean }
 *     responses:
 *       200:
 *         description: Usuário atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       404:
 *         description: Usuário não encontrado
 */
router.put('/:id', ctrl.atualizar);

/**
 * @swagger
 * /admin/usuarios/{id}/senha:
 *   patch:
 *     tags: [Admin - Usuários]
 *     summary: Redefine a senha de um usuário do tenant
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
 *             required: [nova_senha]
 *             properties:
 *               nova_senha:
 *                 type: string
 *                 minLength: 6
 *                 example: novaSenha123
 *     responses:
 *       200:
 *         description: Senha redefinida com sucesso
 *       404:
 *         description: Usuário não encontrado
 */
router.patch('/:id/senha', ctrl.redefinirSenha);

/**
 * @swagger
 * /admin/usuarios/{id}/toggle-ativo:
 *   patch:
 *     tags: [Admin - Usuários]
 *     summary: Ativa ou desativa um usuário do tenant (toggle)
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
 *         description: Usuário não encontrado
 */
router.patch('/:id/toggle-ativo', ctrl.toggleAtivo);

module.exports = router;
