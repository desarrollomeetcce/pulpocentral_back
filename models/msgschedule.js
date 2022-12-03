'use strict';
const {
    Model
} = require('sequelize');


module.exports = (sequelize, DataTypes) => {
    class MsgSchedule extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {

            this.belongsTo(models.MassiveMessage, { foreignKey: 'idMassive' });
            this.belongsTo(models.MessageTemplate, { foreignKey: 'idTemplate' });
           // this.belongsToMany(models.File,{ through: 'TemplateFileRelations' })
        }
    };
    
    MsgSchedule.init({
        name: {
            type: DataTypes.STRING,
        },
        status: {
            type: DataTypes.STRING,
        },
        type: {
            type: DataTypes.STRING,
        },
        user: {
            type: DataTypes.STRING,
        },
        idTemplate: {
            type: DataTypes.INTEGER,
            references: {
                model: 'MessageTemplate',
                key: 'id',
            }
        },
        idMassive: {
            type: DataTypes.INTEGER,
            references: {
                model: 'MassiveMessage',
                key: 'id',
            }
        },
        sendAt: {
            type: DataTypes.DATE,
        },
        delay: {
            type: DataTypes.INTEGER,
        },
    }, {
        sequelize,
        modelName: 'MsgSchedule',
    });

    return MsgSchedule;
};