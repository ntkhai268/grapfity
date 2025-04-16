const db = require('../models/index.js'); //import db từ file index.js trong thư mục models

'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Track extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
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
        foreignKey: 'trackId'
      });
      Track.hasMany(models.listeningHistory, {
        foreignKey: 'trackId'
      });
      Track.hasOne(models.Metadata, {
        foreignKey: 'track_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE' //cần tìm hiểu tại sao lại đặt onDelete và onUpdate ở hasOne
      });
    }
  }
  Track.init({
    trackUrl: DataTypes.STRING,
    imageUrl: DataTypes.STRING,
    uploaderId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Track',
  });
  return Track;
};