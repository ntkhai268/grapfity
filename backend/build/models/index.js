import dotenv from 'dotenv';
dotenv.config();
import Sequelize from 'sequelize';

// Tạo đối tượng sequelize
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
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
  timestamps: true,
  // sửa lại "timestamp" thành "timestamps"
  logging: true
});

// Khởi tạo hàm kết nối để gọi khi chạy app
const connectToDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Kết nối với CSDL thành công!');
  } catch (error) {
    console.error('không thể kết nối với CSDL', error);
  }
};

// Hàm khởi tạo các model và trả về db
const initDb = async () => {
  const db = {
    sequelize,
    Sequelize,
    connectToDB
  };

  // Tải tất cả các model một cách bất đồng bộ
  db.Track = (await import('./track.js')).default(sequelize, Sequelize.DataTypes);
  db.User = (await import('./user.js')).default(sequelize, Sequelize.DataTypes);
  db.Like = (await import('./like.js')).default(sequelize, Sequelize.DataTypes);
  db.Playlist = (await import('./playlist.js')).default(sequelize, Sequelize.DataTypes);
  db.Role = (await import('./role.js')).default(sequelize, Sequelize.DataTypes);
  db.listeningHistory = (await import('./listeninghistory.js')).default(sequelize, Sequelize.DataTypes);
  db.searchHistory = (await import('./searchhistory.js')).default(sequelize, Sequelize.DataTypes);
  db.Metadata = (await import('./metadata.js')).default(sequelize, Sequelize.DataTypes);
  db.PlaylistTrack = (await import('./playlisttrack.js')).default(sequelize, Sequelize.DataTypes);

  // Khởi tạo các quan hệ (associations) nếu có
  Object.keys(db).forEach(modelName => {
    if (db[modelName] && db[modelName].associate) {
      db[modelName].associate(db);
    }
  });
  return db;
};

// Khởi tạo db và xuất ra đối tượng db
const db = await initDb(); // Chờ đến khi tất cả các model được tải xong

export default db;