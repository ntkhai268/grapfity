'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class listeningHistory extends Model {
    static associate(models) {
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
    listenCount: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'listeningHistory'
  });

  return listeningHistory;
};
