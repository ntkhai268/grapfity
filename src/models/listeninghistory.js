'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class listeningHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      listeningHistory.belongsTo(models.User, {
        foreignKey: 'userId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      listeningHistory.belongsTo(models.Track, {
        foreignKey: 'trackId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }
  listeningHistory.init({
    userId: DataTypes.INTEGER,
    trackId: DataTypes.INTEGER,
    timestamp: DataTypes.TIME
  }, {
    sequelize,
    modelName: 'listeningHistory',
  });
  return listeningHistory;
};