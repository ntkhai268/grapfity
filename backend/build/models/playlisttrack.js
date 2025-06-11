'use strict';

import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class PlaylistTrack extends Model {
    static associate(models) {
      PlaylistTrack.belongsTo(models.Track, {
        foreignKey: 'trackId'
      });
      PlaylistTrack.belongsTo(models.Playlist, {
        foreignKey: 'playlistId'
      });
    }
  }
  PlaylistTrack.init({
    playlistId: DataTypes.INTEGER,
    trackId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'PlaylistTrack'
  });
  return PlaylistTrack;
};