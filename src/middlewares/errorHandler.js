const { ValidationError, UniqueConstraintError, ForeignKeyConstraintError } = require('sequelize');

module.exports = (err, req, res, next) => {
  console.error(err);

  if (err.isJoi || err.name === 'ValidationError' && err.details) {
    return res.status(400).json({
      error: 'Dados inválidos.',
      detalhes: err.details?.map(d => d.message) || [err.message],
    });
  }

  if (err instanceof UniqueConstraintError) {
    return res.status(409).json({
      error: 'Registro duplicado.',
      campo: err.errors?.[0]?.path,
    });
  }

  if (err instanceof ForeignKeyConstraintError) {
    return res.status(400).json({
      error: 'Referência inválida. Verifique os dados relacionados.',
    });
  }

  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: 'Dados inválidos.',
      detalhes: err.errors?.map(e => e.message),
    });
  }

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Erro interno do servidor.',
  });
};
