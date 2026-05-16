const { LogAuditoria } = require('../models');

async function registrarLog(req, { acao, entidade, entidade_id, dados_anteriores, dados_novos }) {
  try {
    await LogAuditoria.create({
      empresa_id: req.empresa?.id ?? null,
      usuario_id: req.usuario?.id ?? null,
      usuario_nome: req.usuario?.nome ?? 'sistema',
      acao,
      entidade: entidade ?? null,
      entidade_id: entidade_id ?? null,
      dados_anteriores: dados_anteriores ?? null,
      dados_novos: dados_novos ?? null,
      ip: req.ip ?? null,
      user_agent: req.headers?.['user-agent'] ?? null,
    });
  } catch {
    // Log nunca deve quebrar a operação principal
  }
}

module.exports = { registrarLog };
