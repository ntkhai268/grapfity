// src/models/track.js
'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Track extends Model {
    static associate(models) {
      Track.belongsTo(models.User, {
        foreignKey: 'uploaderId',
      });

      Track.belongsToMany(models.Playlist, {
        through: 'PlaylistTrack',
        foreignKey: 'trackId',
        otherKey: 'playlistId'
      });

      Track.hasMany(models.Like, {
        foreignKey: 'trackId',
      });

      Track.hasMany(models.listeningHistory, {
        foreignKey: 'trackId',
      });

      Track.hasOne(models.Metadata, {
        foreignKey: 'track_id',
      });
    }
  }

  Track.init({
    trackUrl: DataTypes.STRING,
    imageUrl: DataTypes.STRING,
    uploaderId: DataTypes.INTEGER,
    privacy: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'public',
      validate: {
        isIn: [['public', 'private']]
      }
    }
  }, {
    sequelize,
    modelName: 'Track'
  });

  Track.addHook('afterDestroy', async (track, options) => {
    const { Like, listeningHistory, Metadata, PlaylistTrack } = sequelize.models;

    await PlaylistTrack.destroy({ where: { trackId: track.id }, transaction: options.transaction });
    await Like.destroy({ where: { trackId: track.id }, transaction: options.transaction });
    await listeningHistory.destroy({ where: { trackId: track.id }, transaction: options.transaction });
    await Metadata.destroy({ where: { track_id: track.id }, transaction: options.transaction });
  });


  return Track;
};
