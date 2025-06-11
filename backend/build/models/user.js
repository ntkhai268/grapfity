'use strict';

import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Track, {
        foreignKey: 'uploaderId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      User.hasMany(models.Playlist, {
        foreignKey: 'userId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      User.hasMany(models.Like, {
        foreignKey: 'userId'
      });
      User.hasMany(models.searchHistory, {
        foreignKey: 'userId'
      });
      User.hasMany(models.listeningHistory, {
        foreignKey: 'userId'
      });
      User.belongsTo(models.Role, {
        foreignKey: 'roleId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }
  User.init({
    userName: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    roleId: DataTypes.INTEGER,
    Name: DataTypes.STRING,
    Birthday: DataTypes.DATEONLY,
    Address: DataTypes.STRING,
    PhoneNumber: DataTypes.STRING,
    Avatar: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User'
  });
  User.addHook('afterDestroy', async (user, options) => {
    const {
      listeningHistory,
      Like
    } = sequelize.models;
    await Promise.all([listeningHistory.destroy({
      where: {
        userId: user.id
      },
      transaction: options.transaction
    }), Like.destroy({
      where: {
        userId: user.id
      },
      transaction: options.transaction
    })]);
  });
  return User;
};