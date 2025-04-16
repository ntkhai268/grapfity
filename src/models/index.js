require('dotenv').config(); // Load biến môi trường từ .env
const Sequelize = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_SERVER,
    port: parseInt(process.env.DB_PORT), // Thêm dòng này
    dialect: 'mssql',
    dialectOptions: {
      options: {
        encrypt: process.env.DB_ENCRYPT === 'true', // Convert string to boolean
        trustServerCertificate: true
      }
    },
    freezeTableName: true,
    timestamp: true,
    logging: true,
  }
);

const db = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

db.Track = require('./track')(sequelize, Sequelize.DataTypes);
db.User = require('./user')(sequelize, Sequelize.DataTypes);
db.Like = require('./like')(sequelize, Sequelize.DataTypes);
db.Playlist = require('./playlist')(sequelize, Sequelize.DataTypes);
db.Role = require('./role')(sequelize, Sequelize.DataTypes);
db.listeningHistory = require('./listeninghistory')(sequelize, Sequelize.DataTypes);
db.searchHistory = require('./searchhistory')(sequelize, Sequelize.DataTypes);
db.Metadata = require('./metadata')(sequelize, Sequelize.DataTypes);

Object.keys(db).forEach(modelName => {
  console.log(modelName);
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
