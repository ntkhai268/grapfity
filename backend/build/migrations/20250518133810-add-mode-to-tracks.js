'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Tracks', 'mode', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'public'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Tracks', 'mode');
  }
};