'use strict';

import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class listeningHistory extends Model {
    static associate(models) {
      listeningHistory.belongsTo(models.User, {
        foreignKey: 'userId'
      });
      listeningHistory.belongsTo(models.Track, {
        foreignKey: 'trackId'
      });
    }
  }
  listeningHistory.init({
    userId: DataTypes.INTEGER,
    trackId: DataTypes.INTEGER,
    listenCount: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'listeningHistory'
  });
  return listeningHistory;
};