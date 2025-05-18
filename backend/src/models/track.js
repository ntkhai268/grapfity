// D:\web_html\gop\grapfity\backend\src\models\track.js
'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Track extends Model {
    static associate(models) {
      Track.belongsTo(models.User, {
        foreignKey: 'uploaderId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
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
        foreignKey: 'trackId'
      });

      Track.hasOne(models.Metadata, {
        foreignKey: 'track_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }

  Track.init({
    trackUrl: DataTypes.STRING,
    imageUrl: DataTypes.STRING,
    uploaderId: DataTypes.INTEGER,
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'approved', 'rejected']]
      }
    },
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
    const {Track} = sequelize.models;
    await Track.destroy({ where: { id: track.id }, transaction: options.transaction});
  })

  return Track;
};
