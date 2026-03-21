const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig
);

// Importar todos os modelos
const Usuario = require('./usuario')(sequelize);
const Fornecedor = require('./fornecedor')(sequelize);
const UnidadeMedida = require('./unidadeMedida')(sequelize);
const CategoriaMP = require('./categoriaMP')(sequelize);
const MateriaPrima = require('./materiaPrima')(sequelize);
const MateriaPrimaFornecedor = require('./materiaPrimaFornecedor')(sequelize);
const PedidoCompra = require('./pedidoCompra')(sequelize);
const PedidoCompraItem = require('./pedidoCompraItem')(sequelize);
const MovimentacaoEstoque = require('./movimentacaoEstoque')(sequelize);
const Formula = require('./formula')(sequelize);
const FormulaIngrediente = require('./formulaIngrediente')(sequelize);
const FormulaVersao = require('./formulaVersao')(sequelize);
const OrdemProducao = require('./ordemProducao')(sequelize);
const OrdemProducaoInsumo = require('./ordemProducaoInsumo')(sequelize);
const Produto = require('./produto')(sequelize);
const LoteProduto = require('./loteProduto')(sequelize);

// Associações
// Usuario
Usuario.hasMany(PedidoCompra, { foreignKey: 'usuario_id' });
Usuario.hasMany(OrdemProducao, { foreignKey: 'usuario_responsavel_id' });

// Fornecedor
Fornecedor.hasMany(PedidoCompra, { foreignKey: 'fornecedor_id' });
Fornecedor.belongsToMany(MateriaPrima, {
  through: MateriaPrimaFornecedor,
  foreignKey: 'fornecedor_id',
});

// UnidadeMedida
UnidadeMedida.hasMany(MateriaPrima, { foreignKey: 'unidade_medida_id' });
UnidadeMedida.hasMany(Formula, { foreignKey: 'rendimento_unidade_id' });
UnidadeMedida.hasMany(FormulaIngrediente, { foreignKey: 'unidade_medida_id' });

// CategoriaMP
CategoriaMP.hasMany(MateriaPrima, { foreignKey: 'categoria_id' });
MateriaPrima.belongsTo(CategoriaMP, { foreignKey: 'categoria_id', as: 'categoria' });

// MateriaPrima
MateriaPrima.belongsTo(UnidadeMedida, { foreignKey: 'unidade_medida_id', as: 'unidadeMedida' });
MateriaPrima.hasMany(MovimentacaoEstoque, { foreignKey: 'materia_prima_id' });
MateriaPrima.hasMany(FormulaIngrediente, { foreignKey: 'materia_prima_id' });
MateriaPrima.hasMany(OrdemProducaoInsumo, { foreignKey: 'materia_prima_id' });
MateriaPrima.belongsToMany(Fornecedor, {
  through: MateriaPrimaFornecedor,
  foreignKey: 'materia_prima_id',
});

// PedidoCompra
PedidoCompra.belongsTo(Fornecedor, { foreignKey: 'fornecedor_id', as: 'fornecedor' });
PedidoCompra.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
PedidoCompra.hasMany(PedidoCompraItem, { foreignKey: 'pedido_id', as: 'itens' });

// PedidoCompraItem
PedidoCompraItem.belongsTo(PedidoCompra, { foreignKey: 'pedido_id' });
PedidoCompraItem.belongsTo(MateriaPrima, { foreignKey: 'materia_prima_id', as: 'materiaPrima' });

// Formula
Formula.belongsTo(UnidadeMedida, { foreignKey: 'rendimento_unidade_id', as: 'rendimentoUnidade' });
Formula.hasMany(FormulaIngrediente, { foreignKey: 'formula_id', as: 'ingredientes' });
Formula.hasMany(FormulaVersao, { foreignKey: 'formula_id', as: 'versoes' });
Formula.hasMany(OrdemProducao, { foreignKey: 'formula_id' });
Formula.hasOne(Produto, { foreignKey: 'formula_id' });

// FormulaIngrediente
FormulaIngrediente.belongsTo(Formula, { foreignKey: 'formula_id' });
FormulaIngrediente.belongsTo(MateriaPrima, { foreignKey: 'materia_prima_id', as: 'materiaPrima' });
FormulaIngrediente.belongsTo(UnidadeMedida, { foreignKey: 'unidade_medida_id', as: 'unidadeMedida' });

// OrdemProducao
OrdemProducao.belongsTo(Formula, { foreignKey: 'formula_id', as: 'formula' });
OrdemProducao.belongsTo(Usuario, { foreignKey: 'usuario_responsavel_id', as: 'responsavel' });
OrdemProducao.hasMany(OrdemProducaoInsumo, { foreignKey: 'ordem_id', as: 'insumos' });
OrdemProducao.hasMany(LoteProduto, { foreignKey: 'ordem_producao_id', as: 'lotes' });

// OrdemProducaoInsumo
OrdemProducaoInsumo.belongsTo(OrdemProducao, { foreignKey: 'ordem_id' });
OrdemProducaoInsumo.belongsTo(MateriaPrima, { foreignKey: 'materia_prima_id', as: 'materiaPrima' });

// Produto
Produto.belongsTo(Formula, { foreignKey: 'formula_id', as: 'formula' });
Produto.belongsTo(UnidadeMedida, { foreignKey: 'unidade_medida_id', as: 'unidadeMedida' });
Produto.hasMany(LoteProduto, { foreignKey: 'produto_id', as: 'lotes' });

// LoteProduto
LoteProduto.belongsTo(Produto, { foreignKey: 'produto_id', as: 'produto' });
LoteProduto.belongsTo(OrdemProducao, { foreignKey: 'ordem_producao_id', as: 'ordemProducao' });

module.exports = {
  sequelize,
  Sequelize,
  Usuario,
  Fornecedor,
  UnidadeMedida,
  CategoriaMP,
  MateriaPrima,
  MateriaPrimaFornecedor,
  PedidoCompra,
  PedidoCompraItem,
  MovimentacaoEstoque,
  Formula,
  FormulaIngrediente,
  FormulaVersao,
  OrdemProducao,
  OrdemProducaoInsumo,
  Produto,
  LoteProduto,
};
