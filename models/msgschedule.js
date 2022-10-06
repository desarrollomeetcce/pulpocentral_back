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

            this.belongsTo(models.WebHook, { foreignKey: 'idWebhook' });
            this.belongsTo(models.MessageTemplate, { foreignKey: 'idTemplate' });
           // this.belongsToMany(models.File,{ through: 'TemplateFileRelations' })
        }
    };
    
    MsgSchedule.init({
        name: {
            type: DataTypes.STRING,
        },
        idWebhook: {
            type: DataTypes.INTEGER,
            references: {
                model: 'WebHook',
                key: 'id',
            }
        },
        idTemplate: {
            type: DataTypes.INTEGER,
            references: {
                model: 'MessageTemplate',
                key: 'id',
            }
        },
        idMassive: {
            type: DataTypes.INTEGER
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