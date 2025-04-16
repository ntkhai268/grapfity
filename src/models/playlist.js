'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Playlist extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
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
    createDate: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Playlist',
  });
  return Playlist;
};