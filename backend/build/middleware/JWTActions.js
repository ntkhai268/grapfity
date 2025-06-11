import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';
const createJWT = payload => {
  const secretKey = process.env.JWT_SECRET_KEY;
  return jwt.sign(payload, secretKey);
};
const verityJWT = token => {
  const secretKey = process.env.JWT_SECRET_KEY;
  let data = null;
  try {
    data = jwt.verify(token, secretKey);
  } catch (error) {
    console.error('Invalid token:', error.message);
  }
  return data;
};

// ✅ export kiểu ES module
export { createJWT, verityJWT };