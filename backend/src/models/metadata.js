'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Metadata extends Model {
    static associate(models) {
      Metadata.belongsTo(models.Track, {
        foreignKey: 'track_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }

  Metadata.init({
    trackname: DataTypes.STRING,
<<<<<<< HEAD
    track_id: DataTypes.INTEGER,
=======
    track_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
>>>>>>> main
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
<<<<<<< HEAD
    tempo: DataTypes.FLOAT,
    duration_ms: DataTypes.INTEGER,
    time_signature: DataTypes.INTEGER,
    year: DataTypes.INTEGER,
    release_date: DataTypes.DATE
=======
    tempo: DataTypes.FLOAT, 
    duration_ms: DataTypes.INTEGER,
    time_signature: DataTypes.INTEGER,
    year: DataTypes.INTEGER,
    release_date: DataTypes.DATEONLY
>>>>>>> main
  }, {
    sequelize,
    modelName: 'Metadata'
  });

  return Metadata;
};
