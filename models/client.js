'use strict';
const {
  Model
} = require('sequelize');


module.exports = (sequelize, DataTypes) => {
  class Client extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    
      this.belongsTo(models.Group, { foreignKey: 'groupId'});
      this.belongsTo(models.User, { foreignKey: 'adviser'});
      this.belongsTo(models.Status, { foreignKey: 'status'});
      this.belongsToMany(models.Comment,{ through: 'ClientCommentRelations' })
      this.belongsToMany(models.Tag,{ through: 'ClientTagRelations' })
    }
  };
  Client.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    country:  DataTypes.STRING,
    city:  DataTypes.STRING,
    gender:  DataTypes.STRING,
    level:  DataTypes.STRING,
    status: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Status', 
        key: 'id', 
      }
    },
    adviser:  DataTypes.INTEGER,
    
    
    groupId: {type: DataTypes.INTEGER,
      references: {
      model: 'Groups', 
      key: 'id', 
    }},
    email: { type:DataTypes.STRING, primaryKey: true}
  }, {
    sequelize,
    modelName: 'Client',
  });

  return Client;
};