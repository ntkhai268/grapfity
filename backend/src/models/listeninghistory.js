// src/models/listeninghistory.js
'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class listeningHistory extends Model {
    static associate(models) {
      // 1. Người nghe
      listeningHistory.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'listener'
      });

      // 2. Bài hát
      listeningHistory.belongsTo(models.Track, {
        foreignKey: 'trackId',
        as: 'track'
      });

      // 3. Metadata (lấy trackname)
      listeningHistory.belongsTo(models.Metadata, {
        foreignKey: 'trackId',
        targetKey: 'track_id',
        as: 'metadata'
      });
    }
  }

  listeningHistory.init({
    userId:      DataTypes.INTEGER,
    trackId:     DataTypes.INTEGER,
    listenCount: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'listeningHistory',

    defaultScope: {
      attributes: ['listenCount','createdAt'],   // chỉ trả về listenCount ở root
      include: [
        {
          association: 'metadata',   // Model.Metadata → trackname
          attributes: ['trackname']
        },
        {
          association: 'track',      // Model.Track → trackUrl, imageUrl, uploaderId
          attributes: ['id','trackUrl', 'imageUrl', 'uploaderId','status','createdAt'],
          include: [
            {
              // từ Track.belongsTo(models.User) để lấy tên uploader :contentReference[oaicite:0]{index=0}:contentReference[oaicite:1]{index=1}
              model: sequelize.models.User,
              attributes: [
                'id',
                ['name', 'UploaderName']  // alias cột name → UploaderName
              ]
            }
          ]
        },
        {
          association: 'listener',   // Model.User (listener) → name của người nghe
          attributes: [
            'id',
            ['name', 'Name']           // alias cột name → Name
          ]
        }
      ]
    }
  });

  return listeningHistory;
};
