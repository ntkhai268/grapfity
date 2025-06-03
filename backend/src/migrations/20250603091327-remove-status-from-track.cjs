'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Tracks', 'status');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('Tracks', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'pending',
    });
  }
};
