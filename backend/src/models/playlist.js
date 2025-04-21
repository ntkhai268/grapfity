'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Playlist extends Model {
    static associate(models) {
      Playlist.belongsTo(models.User, {
        foreignKey: 'userId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
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
    imageUrl: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Playlist'
  });

  return Playlist;
};
