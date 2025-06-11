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
    imageUrl: DataTypes.STRING,
    privacy: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'public' // hoặc 'private' tùy bạn
    }
  }, {
    sequelize,
    modelName: 'Playlist'
  });

  // Playlist.addHook('afterDestroy', async (playlist, options) => {
  //   const { Playlist } = sequelize.models;
  //   await Playlist.destroy({ where: { playlistId: playlist.id }, transaction: options.transaction });
  // })
  // Playlist.addHook('afterDestroy', async (playlist, options) => {
  //   const { PlaylistTrack } = sequelize.models; 
  //   console.log(`[Hook afterDestroy Playlist ${playlist.id}] Deleting related PlaylistTracks.`);
  //   await PlaylistTrack.destroy({
  //     where: { playlistId: playlist.id }, // Tìm các track thuộc về playlist vừa bị xóa
  //     transaction: options.transaction // Quan trọng: Sử dụng transaction từ hook options
  //   });
  // });

  return Playlist;
};