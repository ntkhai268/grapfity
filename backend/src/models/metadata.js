'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Metadata extends Model {
    static associate(models) {
      Metadata.belongsTo(models.Track, {
        foreignKey: 'track_id',
      });
    }
  }

  Metadata.init({
    trackname: DataTypes.STRING,
    track_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    lyrics: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    duration_ms: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    energy: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    loudness: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    tempo: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    key: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    mode: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    embedding: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const raw = this.getDataValue('embedding');
        return raw ? JSON.parse(raw) : null;
      },
      set(val) {
        this.setDataValue('embedding', JSON.stringify(val));
      }
    },
    release_date: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Metadata'
  });

  return Metadata;
};
