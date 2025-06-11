// D:\web_html\gop\grapfity\backend\src\migrations\20250415153910-create-metadata.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Metadata', {
      trackname: {
        type: Sequelize.STRING
      },
      track_id: {
        //Đây là thực thể yếu nên khóa ngoại tham chiếu đến Tracks cũng chính là khóa chính
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'Tracks',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      explicit: {
        type: Sequelize.BOOLEAN
      },
      danceability: {
        type: Sequelize.FLOAT
      },
      energy: {
        type: Sequelize.FLOAT
      },
      key: {
        type: Sequelize.INTEGER
      },
      loudness: {
        type: Sequelize.FLOAT
      },
      mode: {
        type: Sequelize.INTEGER
      },
      speechiness: {
        type: Sequelize.FLOAT
      },
      acousticness: {
        type: Sequelize.FLOAT
      },
      instrumentalness: {
        type: Sequelize.FLOAT
      },
      liveness: {
        type: Sequelize.FLOAT
      },
      valence: {
        type: Sequelize.FLOAT
      },
      tempo: {
        type: Sequelize.FLOAT
      },
      duration_ms: {
        type: Sequelize.INTEGER
      },
      time_signature: {
        type: Sequelize.INTEGER
      },
      year: {
        type: Sequelize.INTEGER
      },
      release_date: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Metadata');
  }
};