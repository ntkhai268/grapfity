'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Metadata extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Metadata.belongsTo(models.Track, {
        foreignKey: 'track_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }
  Metadata.init({
    trackname: DataTypes.STRING,
    track_id: DataTypes.INTEGER,
    explicit: DataTypes.BOOLEAN,
    danceability: DataTypes.FLOAT,
    energy: DataTypes.FLOAT,
    key: DataTypes.INTEGER,
    loudness: DataTypes.FLOAT,
    mode: DataTypes.INTEGER,
    speechiness: DataTypes.FLOAT,
    acousticness: DataTypes.FLOAT,
    instrumentalness: DataTypes.FLOAT,
    liveness: DataTypes.FLOAT,
    valence: DataTypes.FLOAT,
    tempo: DataTypes.FLOAT,
    duration_ms: DataTypes.INTEGER,
    time_signature: DataTypes.INTEGER,
    year: DataTypes.INTEGER,
    release_date: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Metadata',
  });
  return Metadata;
};