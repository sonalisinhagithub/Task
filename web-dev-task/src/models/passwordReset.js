module.exports = (sequelize, DataTypes) => {
    const PasswordReset = sequelize.define('PasswordReset', {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        token: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        tableName: 'password_resets',
        timestamps: true
    });

    return PasswordReset;
};
