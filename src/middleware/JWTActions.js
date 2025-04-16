require('dotenv').config();

const jwt = require('jsonwebtoken');

const createJWT = () => {
    const payload = {
        username: 'admin',
        id: 1,
        role: 'admin'
    };
    const secretKey = process.env.JWT_SECRET_KEY;
    return jwt.sign(payload, secretKey);
}

const verityJWT = (token) => {
    const secretKey = process.env.JWT_SECRET_KEY;
    let data = null;
    try {
        data = jwt.verify(token, secretKey);
    } catch (error) {
        console.error('Invalid token:', error.message);
    }
    return data;
}

module.exports = {
    createJWT,
    verityJWT
}
