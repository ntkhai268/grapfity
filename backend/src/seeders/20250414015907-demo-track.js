'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert('Tracks', [
      {
      trackUrl: '../public/assects/track_mp3/testify.mp3',
      imageUrl: '../public/assects/track_image/testify.jpg',
      uploaderId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      },
      {
        trackUrl: 'url2',
        imageUrl: 'iurl2',
        uploaderId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        trackUrl: 'url3',
        imageUrl: 'iurl3',
        uploaderId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        trackUrl: 'iurl4',
        imageUrl: 'iurl4',
        uploaderId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        trackUrl: 'iurl5',
        imageUrl: 'iurl5',
        uploaderId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        trackUrl: 'iurl6',
        imageUrl: 'iurl6',
        uploaderId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Tracks', null, {});
  }
};
