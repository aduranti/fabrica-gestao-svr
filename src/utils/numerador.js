const { Op } = require('sequelize');

/**
 * Gera número sequencial por empresa. Ex: PC-2026-0001 (isolado por tenant).
 */
async function gerarNumero(modelo, prefixo, empresaId, campoNumero = 'numero') {
  const ano = new Date().getFullYear();
  const prefixoAno = `${prefixo}-${ano}-`;

  const where = { [campoNumero]: { [Op.like]: `${prefixoAno}%` } };
  if (empresaId != null) where.empresa_id = empresaId;

  const ultimo = await modelo.findOne({
    where,
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
 * Gera número de lote por empresa. Ex: L150524A0001
 */
async function gerarNumeroLote(LoteProduto, turno = 'A', empresaId, data = new Date()) {
  const dd = String(data.getDate()).padStart(2, '0');
  const mm = String(data.getMonth() + 1).padStart(2, '0');
  const aa = String(data.getFullYear()).slice(-2);
  const prefixo = `L${dd}${mm}${aa}${turno}`;

  const where = { numero_lote: { [Op.like]: `${prefixo}%` } };
  if (empresaId != null) where.empresa_id = empresaId;

  const ultimo = await LoteProduto.findOne({
    where,
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
