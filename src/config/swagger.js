const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Fábrica Gestão API',
      version: '1.0.0',
      description: 'API para gestão de fábrica de sabonetes, tinturas de ervas e pomadas',
    },
    servers: [
      { url: 'http://localhost:3000/api/v1', description: 'Desenvolvimento' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        // Auth
        LoginInput: {
          type: 'object',
          required: ['email', 'senha'],
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@fabrica.com' },
            senha: { type: 'string', example: 'admin123' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            usuario: { $ref: '#/components/schemas/Usuario' },
          },
        },
        // Usuario
        Usuario: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            nome: { type: 'string' },
            email: { type: 'string', format: 'email' },
            perfil: { type: 'string', enum: ['admin', 'operador', 'comprador'] },
            ativo: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        UsuarioInput: {
          type: 'object',
          required: ['nome', 'email', 'senha_hash', 'perfil'],
          properties: {
            nome: { type: 'string', example: 'João Silva' },
            email: { type: 'string', format: 'email', example: 'joao@fabrica.com' },
            senha_hash: { type: 'string', minLength: 6, example: 'senha123' },
            perfil: { type: 'string', enum: ['admin', 'operador', 'comprador'] },
            ativo: { type: 'boolean', default: true },
          },
        },
        // Fornecedor
        Fornecedor: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            razao_social: { type: 'string' },
            nome_fantasia: { type: 'string' },
            cnpj_cpf: { type: 'string' },
            telefone: { type: 'string' },
            email: { type: 'string' },
            endereco: { type: 'string' },
            cidade: { type: 'string' },
            estado: { type: 'string' },
            cep: { type: 'string' },
            ativo: { type: 'boolean' },
          },
        },
        FornecedorInput: {
          type: 'object',
          required: ['razao_social'],
          properties: {
            razao_social: { type: 'string', example: 'Distribuidora Natura Ltda' },
            nome_fantasia: { type: 'string', example: 'Distribuidora Natura' },
            cnpj_cpf: { type: 'string', example: '12.345.678/0001-90' },
            telefone: { type: 'string', example: '(11) 99999-9999' },
            email: { type: 'string', example: 'contato@natura.com' },
            endereco: { type: 'string' },
            cidade: { type: 'string' },
            estado: { type: 'string', maxLength: 2 },
            cep: { type: 'string' },
            observacoes: { type: 'string' },
          },
        },
        // Matéria Prima
        MateriaPrima: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            codigo: { type: 'string' },
            nome: { type: 'string' },
            descricao: { type: 'string' },
            categoria_id: { type: 'integer' },
            unidade_medida_id: { type: 'integer' },
            estoque_atual: { type: 'number' },
            estoque_minimo: { type: 'number' },
            estoque_maximo: { type: 'number' },
            custo_medio: { type: 'number' },
            ativo: { type: 'boolean' },
            categoria: { $ref: '#/components/schemas/CategoriaMP' },
            unidadeMedida: { $ref: '#/components/schemas/UnidadeMedida' },
          },
        },
        MateriaPrimaInput: {
          type: 'object',
          required: ['nome', 'categoria_id', 'unidade_medida_id'],
          properties: {
            codigo: { type: 'string', example: 'MP-001' },
            nome: { type: 'string', example: 'Óleo de Coco' },
            descricao: { type: 'string' },
            categoria_id: { type: 'integer', example: 1 },
            unidade_medida_id: { type: 'integer', example: 1 },
            estoque_minimo: { type: 'number', example: 5 },
            estoque_maximo: { type: 'number', example: 50 },
          },
        },
        CategoriaMP: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            nome: { type: 'string' },
            descricao: { type: 'string' },
          },
        },
        UnidadeMedida: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            nome: { type: 'string' },
            sigla: { type: 'string' },
          },
        },
        // Pedido Compra
        PedidoCompra: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            numero: { type: 'string' },
            fornecedor_id: { type: 'integer' },
            status: { type: 'string', enum: ['rascunho', 'enviado', 'parcial', 'recebido', 'cancelado'] },
            data_pedido: { type: 'string', format: 'date' },
            data_previsao: { type: 'string', format: 'date' },
            valor_total: { type: 'number' },
            itens: { type: 'array', items: { $ref: '#/components/schemas/PedidoCompraItem' } },
          },
        },
        PedidoCompraInput: {
          type: 'object',
          required: ['fornecedor_id', 'data_pedido', 'itens'],
          properties: {
            fornecedor_id: { type: 'integer', example: 1 },
            data_pedido: { type: 'string', format: 'date', example: '2026-03-20' },
            data_previsao: { type: 'string', format: 'date', example: '2026-03-27' },
            observacoes: { type: 'string' },
            itens: {
              type: 'array',
              items: {
                type: 'object',
                required: ['materia_prima_id', 'quantidade_pedida', 'preco_unitario'],
                properties: {
                  materia_prima_id: { type: 'integer' },
                  quantidade_pedida: { type: 'number' },
                  preco_unitario: { type: 'number' },
                },
              },
            },
          },
        },
        PedidoCompraItem: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            materia_prima_id: { type: 'integer' },
            quantidade_pedida: { type: 'number' },
            quantidade_recebida: { type: 'number' },
            preco_unitario: { type: 'number' },
            subtotal: { type: 'number' },
          },
        },
        // Formula
        Formula: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            codigo: { type: 'string' },
            nome: { type: 'string' },
            categoria: { type: 'string', enum: ['sabonete', 'tintura', 'pomada'] },
            rendimento_quantidade: { type: 'number' },
            versao: { type: 'integer' },
            status: { type: 'string', enum: ['rascunho', 'ativa', 'inativa'] },
            instrucoes_producao: { type: 'string' },
            ingredientes: { type: 'array', items: { $ref: '#/components/schemas/FormulaIngrediente' } },
          },
        },
        FormulaInput: {
          type: 'object',
          required: ['nome', 'categoria', 'rendimento_quantidade', 'rendimento_unidade_id', 'ingredientes'],
          properties: {
            codigo: { type: 'string', example: 'SAB-001' },
            nome: { type: 'string', example: 'Sabonete de Lavanda' },
            categoria: { type: 'string', enum: ['sabonete', 'tintura', 'pomada'] },
            rendimento_quantidade: { type: 'number', example: 1000 },
            rendimento_unidade_id: { type: 'integer', example: 2 },
            instrucoes_producao: { type: 'string' },
            observacoes: { type: 'string' },
            ingredientes: {
              type: 'array',
              items: {
                type: 'object',
                required: ['materia_prima_id', 'quantidade', 'unidade_medida_id'],
                properties: {
                  materia_prima_id: { type: 'integer' },
                  quantidade: { type: 'number' },
                  unidade_medida_id: { type: 'integer' },
                  percentual: { type: 'number' },
                  fase: { type: 'string', enum: ['aquosa', 'oleosa', 'esfriamento', 'final', 'unica'] },
                  ordem: { type: 'integer' },
                  observacoes: { type: 'string' },
                },
              },
            },
          },
        },
        FormulaIngrediente: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            materia_prima_id: { type: 'integer' },
            quantidade: { type: 'number' },
            percentual: { type: 'number' },
            fase: { type: 'string' },
            ordem: { type: 'integer' },
            materiaPrima: { $ref: '#/components/schemas/MateriaPrima' },
          },
        },
        // Ordem Producao
        OrdemProducao: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            numero: { type: 'string' },
            formula_id: { type: 'integer' },
            quantidade_planejada: { type: 'number' },
            quantidade_produzida: { type: 'number' },
            status: { type: 'string', enum: ['planejada', 'em_producao', 'concluida', 'cancelada'] },
            data_planejada: { type: 'string', format: 'date' },
            custo_total_calculado: { type: 'number' },
            lote: { type: 'string' },
          },
        },
        OrdemProducaoInput: {
          type: 'object',
          required: ['formula_id', 'quantidade_planejada', 'data_planejada'],
          properties: {
            formula_id: { type: 'integer', example: 1 },
            quantidade_planejada: { type: 'number', example: 500 },
            data_planejada: { type: 'string', format: 'date', example: '2026-03-25' },
            lote: { type: 'string', example: 'LOTE-2026-001' },
            observacoes: { type: 'string' },
          },
        },
        // Produto
        Produto: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            codigo: { type: 'string' },
            nome: { type: 'string' },
            formula_id: { type: 'integer' },
            preco_custo: { type: 'number' },
            preco_venda: { type: 'number' },
            estoque_atual: { type: 'number' },
            estoque_minimo: { type: 'number' },
            ativo: { type: 'boolean' },
          },
        },
        // Erro
        Erro: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/modules/**/routes.js'],
};

module.exports = swaggerJsdoc(options);
