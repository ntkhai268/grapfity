'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Like extends Model {
    static associate(models) {
      Like.belongsTo(models.User, {
        foreignKey: 'userId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });

      Like.belongsTo(models.Track, {
        foreignKey: 'trackId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }

  Like.init({
    userId: DataTypes.INTEGER,
    trackId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Like'
  });

  return Like;
};
