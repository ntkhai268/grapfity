'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Tracks', 'lyrics', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('Tracks', 'trackname', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Tracks', 'lyrics');
    await queryInterface.removeColumn('Tracks', 'trackname');
  }
};
