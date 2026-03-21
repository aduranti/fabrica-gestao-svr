/**
 * Calcula o novo custo médio ponderado
 * Fórmula: (estoque_atual * custo_atual + quantidade_entrada * custo_entrada) / novo_estoque
 */
function calcularCustoMedio(estoqueAtual, custoAtual, quantidadeEntrada, custoEntrada) {
  const valorAtual = estoqueAtual * custoAtual;
  const valorEntrada = quantidadeEntrada * custoEntrada;
  const novoEstoque = estoqueAtual + quantidadeEntrada;

  if (novoEstoque === 0) return 0;
  return (valorAtual + valorEntrada) / novoEstoque;
}

module.exports = { calcularCustoMedio };
