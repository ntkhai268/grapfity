'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class searchHistory extends Model {
    static associate(models) {
      searchHistory.belongsTo(models.User, {
        foreignKey: 'userId',
      });
    }
  }

  searchHistory.init({
    userId: DataTypes.INTEGER,
    searchQuery: DataTypes.STRING,
    timestamp: DataTypes.TIME
  }, {
    sequelize,
    modelName: 'searchHistory'
  });

  return searchHistory;
};
