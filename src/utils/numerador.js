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

/**
 * Gera número de lote no formato L{DD}{MM}{AA}{Turno}{SEQ}
 * Exemplo: L150424A0001
 * @param {Model} LoteProduto - modelo Sequelize
 * @param {string} turno - 'A', 'B' ou 'C'
 * @param {Date} data - data de fabricação (default: hoje)
 */
async function gerarNumeroLote(LoteProduto, turno = 'A', data = new Date()) {
  const dd = String(data.getDate()).padStart(2, '0');
  const mm = String(data.getMonth() + 1).padStart(2, '0');
  const aa = String(data.getFullYear()).slice(-2);
  const prefixo = `L${dd}${mm}${aa}${turno}`;

  const ultimo = await LoteProduto.findOne({
    where: {
      numero_lote: { [require('sequelize').Op.like]: `${prefixo}%` },
    },
    order: [['numero_lote', 'DESC']],
  });

  let seq = 1;
  if (ultimo) {
    const seqStr = ultimo.numero_lote.slice(prefixo.length);
    seq = parseInt(seqStr) + 1;
  }

  return `${prefixo}${String(seq).padStart(4, '0')}`;
}

module.exports = { gerarNumero, gerarNumeroLote };
