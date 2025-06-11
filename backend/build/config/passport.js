const LocalStrategy = require('passport-local').Strategy;
const {
  handleUserLogin
} = require('../services/user_service');
const db = require('../models'); // Import db từ models

module.exports = passport => {
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await handleUserLogin(username, password); // Gọi hàm của bạn
      console.log('User trong này:', user);
      if (!user) return done(null, false, {
        message: 'Sai thông tin đăng nhập'
      });
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));
  passport.serializeUser((user, done) => {
    try {
      done(null, user.id); // Lưu ID vào session
    } catch (err) {
      done(err);
    }
  });
  passport.deserializeUser(async (id, done) => {
    try {
      // Gợi ý: nên có getUserById() từ DB
      const user = await db.User.findByPk(id); // nếu dùng Sequelize
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};