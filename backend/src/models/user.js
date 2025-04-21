'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here
      // ví dụ nếu bạn có liên kết:
      // User.hasMany(models.Track, { foreignKey: 'uploaderId' });
    }
  }

  User.init({
    userName: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    roleId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'User'
  });

  return User;
};
