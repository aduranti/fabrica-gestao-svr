const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const Usuario = sequelize.define('Usuario', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    empresa_id: { type: DataTypes.INTEGER, allowNull: true },
    nome: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false },
    senha_hash: { type: DataTypes.STRING(255), allowNull: false },
    perfil: {
      type: DataTypes.ENUM('super_admin', 'admin', 'operador', 'comprador'),
      defaultValue: 'operador',
    },
    ativo: { type: DataTypes.BOOLEAN, defaultValue: true },
    ultimo_acesso: { type: DataTypes.DATE, allowNull: true },
  }, {
    tableName: 'usuarios',
    hooks: {
      beforeCreate: async (usuario) => {
        if (usuario.senha_hash) {
          usuario.senha_hash = await bcrypt.hash(usuario.senha_hash, 10);
        }
      },
      beforeUpdate: async (usuario) => {
        if (usuario.changed('senha_hash')) {
          usuario.senha_hash = await bcrypt.hash(usuario.senha_hash, 10);
        }
      },
    },
  });

  Usuario.prototype.validarSenha = async function (senha) {
    return bcrypt.compare(senha, this.senha_hash);
  };

  Usuario.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.senha_hash;
    return values;
  };

  return Usuario;
};
