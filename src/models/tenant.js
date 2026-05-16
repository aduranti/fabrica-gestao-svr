const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Tenant', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tipo: { type: DataTypes.ENUM('pf', 'pj'), allowNull: false },
    documento: { type: DataTypes.STRING(20), allowNull: true },
    nome: { type: DataTypes.STRING(150), allowNull: false },
    nome_fantasia: { type: DataTypes.STRING(150), allowNull: true },
    email_contato: { type: DataTypes.STRING(150), allowNull: false },
    telefone: { type: DataTypes.STRING(20), allowNull: true },
    slug: { type: DataTypes.STRING(60), allowNull: false, unique: true },
    plano: {
      type: DataTypes.ENUM('trial', 'basico', 'profissional'),
      defaultValue: 'trial',
      allowNull: false,
    },
    ativo: { type: DataTypes.BOOLEAN, defaultValue: true },
    trial_expira: { type: DataTypes.DATEONLY, allowNull: true },
  }, { tableName: 'tenants' });
};
