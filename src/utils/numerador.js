/**
 * Gera um número sequencial formatado para pedidos, ordens, etc.
 * Exemplo: PC-2024-0001, OP-2024-0001
 */
async function gerarNumero(modelo, prefixo, campoNumero = 'numero') {
  const ano = new Date().getFullYear();
  const prefixoAno = `${prefixo}-${ano}-`;

  const ultimo = await modelo.findOne({
    where: {
      [campoNumero]: { [require('sequelize').Op.like]: `${prefixoAno}%` },
    },
    order: [[campoNumero, 'DESC']],
  });

  let seq = 1;
  if (ultimo) {
    const partes = ultimo[campoNumero].split('-');
    seq = parseInt(partes[partes.length - 1]) + 1;
  }

  return `${prefixoAno}${String(seq).padStart(4, '0')}`;
}

module.exports = { gerarNumero };
