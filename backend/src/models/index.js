import dotenv from 'dotenv';
dotenv.config(); // Load biến môi trường từ .env

import Sequelize from 'sequelize';

// Tạo đối tượng sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_SERVER,
    port: parseInt(process.env.DB_PORT),
    dialect: 'mssql',
    dialectOptions: {
      options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: true
      }
    },
    freezeTableName: true,
    timestamp: true,
    logging: true
  }
);

// Khởi tạo hàm kết nối để gọi khi chạy app
const connectToDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection has been established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
};

// Khởi tạo object chứa các model
const db = {
  sequelize,
  Sequelize,
  connectToDB,
  Track: (await import('./track.js')).default(sequelize, Sequelize.DataTypes),
  User: (await import('./user.js')).default(sequelize, Sequelize.DataTypes),
  Like: (await import('./like.js')).default(sequelize, Sequelize.DataTypes),
  Playlist: (await import('./playlist.js')).default(sequelize, Sequelize.DataTypes),
  Role: (await import('./role.js')).default(sequelize, Sequelize.DataTypes),
  listeningHistory: (await import('./listeninghistory.js')).default(sequelize, Sequelize.DataTypes),
  searchHistory: (await import('./searchhistory.js')).default(sequelize, Sequelize.DataTypes),
  Metadata: (await import('./metadata.js')).default(sequelize, Sequelize.DataTypes),
  PlaylistTrack: (await import('./playlisttrack.js')).default(sequelize, Sequelize.DataTypes),
};

// Gọi hàm associate nếu có
Object.keys(db).forEach(modelName => {
  if (db[modelName] && db[modelName].associate) {
    db[modelName].associate(db);
  }
});

export default db;
