const { Sequelize } = require('sequelize');
const UserModel = require('./user');
const PasswordResetModel = require('./passwordReset');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql'
});

const User = UserModel(sequelize, Sequelize);
const PasswordReset = PasswordResetModel(sequelize, Sequelize);

// Associations
User.hasMany(PasswordReset, { foreignKey: 'userId' });
PasswordReset.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
    sequelize,
    User,
    PasswordReset
};
