'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Playlist extends Model {
    static associate(models) {
      Playlist.belongsTo(models.User, {
        foreignKey: 'userId',
      });

      Playlist.belongsToMany(models.Track, {
        through: 'PlaylistTrack',
        foreignKey: 'playlistId',
        otherKey: 'trackId'
      });
    }
  }

  Playlist.init({
    userId: DataTypes.INTEGER,
    title: DataTypes.STRING,
    createDate: DataTypes.DATE,
    imageUrl: DataTypes.STRING,
    privacy: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'public'  // hoặc 'private' tùy bạn
    }
  }, {
    sequelize,
    modelName: 'Playlist'
  });

  Playlist.addHook('afterDestroy', async (playlist, options) => {
    const { PlaylistTrack } = sequelize.models;

    await PlaylistTrack.destroy({
      where: { playlistId: playlist.id },
      transaction: options.transaction
    });
  });


  return Playlist;
};
