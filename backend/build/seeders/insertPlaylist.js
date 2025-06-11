'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Bật IDENTITY_INSERT
      await queryInterface.sequelize.query(`SET IDENTITY_INSERT [dbo].[Playlists] ON;`, {
        transaction
      });

      // 2. Dùng Sequelize để insert thủ công
      const Playlist = (await import('../models/index.js')).default.Playlist;
      await Playlist.create({
        id: 10007,
        userId: 1,
        title: 'Playlist tạo bằng Sequelize lần cuối',
        createDate: new Date(),
        imageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        transaction
      });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      console.error('❌ Lỗi khi chèn thủ công bằng Sequelize:', err);
      throw err;
    } finally {
      // 3. Đảm bảo luôn tắt IDENTITY_INSERT
      try {
        await queryInterface.sequelize.query(`SET IDENTITY_INSERT [dbo].[Playlists] OFF;`);
      } catch (offErr) {
        console.warn('⚠️ Không thể tắt IDENTITY_INSERT:', offErr.message);
      }
    }
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Playlists', {
      id: 10002
    });
  }
};