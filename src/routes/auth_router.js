const express = require('express');
const passport = require('passport');
const router = express.Router();
const { createUserController } = require('../controllers/userController');

// Đăng ký
router.post('/register', createUserController);

// Đăng nhập dùng Passport
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ message: 'Sai thông tin đăng nhập' });

        req.logIn(user, (err) => {
            if (err) return next(err);
            return res.json({ message: 'Đăng nhập thành công', user });
        });
    })(req, res, next);
});

module.exports = router;
