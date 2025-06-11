// D:\web_html\gop\grapfity\backend\src\migrations\20250507020627-add-lyrics-to-metadata.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Metadata', 'lyrics', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Metadata', 'lyrics');
  }
};