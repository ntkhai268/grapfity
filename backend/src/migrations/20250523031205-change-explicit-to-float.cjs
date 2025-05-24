'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Metadata', 'explicit', {
      type: Sequelize.FLOAT,
      allowNull: true, // hoặc false nếu bạn muốn bắt buộc có giá trị
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Metadata', 'explicit', {
      type: Sequelize.BOOLEAN,
      allowNull: true, // hoặc false nếu ban đầu bắt buộc
    });
  }
};
