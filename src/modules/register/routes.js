const express = require('express');
const router = express.Router();
const ctrl = require('./controller');

/**
 * @swagger
 * tags:
 *   name: Registro
 *   description: Cadastro público de novas contas (sem autenticação)
 */

/**
 * @swagger
 * /register:
 *   post:
 *     tags: [Registro]
 *     summary: Cria uma nova conta (tenant + usuário admin)
 *     description: >
 *       Endpoint público — não requer token. Cria o tenant (PF ou PJ),
 *       o usuário administrador e as categorias padrão de MP em uma única transação.
 *       Retorna JWT para entrar direto no sistema após o cadastro.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/RegisterPFInput'
 *               - $ref: '#/components/schemas/RegisterPJInput'
 *           examples:
 *             pessoaFisica:
 *               summary: Pessoa Física
 *               value:
 *                 tipo: pf
 *                 cpf: "12345678901"
 *                 nome: Maria Silva
 *                 email_contato: maria@email.com
 *                 telefone: "11999998888"
 *                 admin_nome: Maria Silva
 *                 admin_email: maria@email.com
 *                 admin_senha: senha123
 *             pessoaJuridica:
 *               summary: Pessoa Jurídica
 *               value:
 *                 tipo: pj
 *                 cnpj: "12345678000195"
 *                 razao_social: Cosméticos da Maria LTDA
 *                 nome_fantasia: Marca Maria
 *                 email_contato: contato@marca.com
 *                 telefone: "11999998888"
 *                 admin_nome: Maria Silva
 *                 admin_email: maria@marca.com
 *                 admin_senha: senha123
 *     responses:
 *       201:
 *         description: Conta criada com sucesso — trial de 30 dias iniciado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterResponse'
 *       400:
 *         description: Dados inválidos (CPF/CNPJ com formato errado, campos obrigatórios ausentes)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       409:
 *         description: E-mail do admin já cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.post('/', ctrl.registrar);

module.exports = router;
