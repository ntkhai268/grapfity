'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('Tracks', 'visibility', 'privacy');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('Tracks', 'privacy', 'visibility');
  }
};
