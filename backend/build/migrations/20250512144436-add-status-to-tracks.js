/** @type {import('sequelize-cli').Migration} */
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Tracks', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'pending'
    });
    await queryInterface.sequelize.query(`
      ALTER TABLE Tracks
      ADD CONSTRAINT chk_track_status
      CHECK (status IN ('pending', 'approved', 'rejected'))
    `);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Tracks', 'status');
  }
};