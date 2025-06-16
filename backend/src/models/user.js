'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Track, {
        foreignKey: 'uploaderId',
      });

      User.hasMany(models.Playlist, {
        foreignKey: 'userId',
      });
      User.hasMany(models.Like, {
        foreignKey: 'userId',
      });
      User.hasMany(models.searchHistory, {
        foreignKey: 'userId',
      });
      User.hasMany(models.listeningHistory, {
        foreignKey: 'userId',
      });

      User.belongsTo(models.Role, {
        foreignKey: 'roleId',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      })
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
    const { Track, Like, Playlist, listeningHistory, Metadata, PlaylistTrack, searchHistory} = sequelize.models;

    const userTracks = await Track.findAll({
      where: { uploaderId: user.id },
      transaction: options.transaction
    });
    console.log('userTracks: ', userTracks);

    for (const track of userTracks) {
      await Metadata.destroy({ where: { track_id: track.id }, transaction: options.transaction });
      await Like.destroy({ where: { trackId: track.id }, transaction: options.transaction });
      await listeningHistory.destroy({ where: { trackId: track.id }, transaction: options.transaction });
      await PlaylistTrack.destroy({ where: { trackId: track.id }, transaction: options.transaction });
    }

    await Track.destroy({ where: { uploaderId: user.id }, transaction: options.transaction });
    await Playlist.destroy({ where: { userId: user.id }, transaction: options.transaction });
    await Like.destroy({ where: { userId: user.id }, transaction: options.transaction });
    await listeningHistory.destroy({ where: { userId: user.id }, transaction: options.transaction });
    await searchHistory.destroy({ where: { userId: user.id }, transaction: options.transaction });
  });

  return User;
};
