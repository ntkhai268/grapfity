'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Playlists', 'privacy', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'public' // hoặc 'private' tùy bạn
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Playlists', 'privacy');
  }
};