import db from '../models/index.js';
import bcrypt from 'bcrypt';
import { createJWT, verityJWT } from '../middleware/JWTActions.js';
const getAllUsers = async () => {
  return db.User.findAll(); // Lấy tất cả dữ liệu trong bảng User
};
const getUserById = async (id, isSelf = false) => {
  try {
    const attributes = isSelf ? ['id', 'userName', 'Name', 'Avatar', 'email', 'Birthday', 'Address', 'PhoneNumber', 'password'] : ['id', 'userName', 'Name', 'Avatar', 'createdAt'];
    const user = await db.User.findByPk(id, {
      attributes
    });
    if (user && isSelf) {
      const {
        password,
        refreshToken,
        ...safeUser
      } = user.dataValues;
      return safeUser;
    }
    return user;
  } catch (error) {
    console.error(`Lỗi khi tìm user với id ${id}:`, error);
    throw new Error('Không thể truy cập dữ liệu người dùng');
  }
};
const createUserService = async payload => {
  try {
    // 1. Kiểm tra email đã tồn tại chưa
    const existingEmail = await db.User.findOne({
      where: {
        email: payload.email
      }
    });
    if (existingEmail) {
      return {
        message: 'Email already exists'
      };
    }

    // 2. Kiểm tra userName đã tồn tại chưa
    const existingUserName = await db.User.findOne({
      where: {
        userName: payload.userName
      }
    });
    if (existingUserName) {
      return {
        message: 'Username already exists'
      };
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(payload.password, 10);

    // 4. Tạo record mới
    const newUser = await db.User.create({
      userName: payload.userName,
      email: payload.email,
      password: hashedPassword,
      roleId: payload.roleId,
      Name: payload.Name || null,
      Birthday: payload.Birthday ? new Date(payload.Birthday) : null,
      Address: payload.Address || null,
      PhoneNumber: payload.PhoneNumber || null
    });
    return {
      message: 'Register successful',
      user: newUser
    };
  } catch (err) {
    console.error('Error in createUserService:', err);
    throw new Error('Error creating user');
  }
};
const handleUserLogin = async (username, password) => {
  try {
    const user = await db.User.findOne({
      where: {
        userName: username
      }
    });
    if (!user) {
      return {
        message: 'Username does not exist'
      };
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return {
        message: 'Incorrect password'
      };
    }
    const payload = {
      userId: user.id
    };
    const token = createJWT(payload);
    return {
      message: 'Login successful',
      token: token,
      roleId: user.roleId
    };
  } catch (err) {
    console.error('Error during login:', err);
    throw new Error('Error checking username');
  }
};
const updateUser = async (id, {
  userName,
  email,
  password,
  Name,
  Birthday,
  Address,
  PhoneNumber,
  Avatar
}) => {
  const user = await db.User.findByPk(id);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  const updateFields = {};
  if (typeof userName === 'string' && userName.trim() !== '') {
    updateFields.userName = userName.trim();
  }
  if (typeof email === 'string' && email.trim() !== '') {
    updateFields.email = email.trim();
  }
  if (typeof password === 'string' && password.trim() !== '') {
    const saltRounds = 10;
    updateFields.password = await bcrypt.hash(password, saltRounds);
  }
  if (typeof Name === 'string' && Name.trim() !== '') {
    updateFields.Name = Name.trim();
  }
  if (Birthday) {
    updateFields.Birthday = Birthday; // đảm bảo frontend gửi đúng định dạng yyyy-mm-dd
  }
  if (typeof Address === 'string' && Address.trim() !== '') {
    updateFields.Address = Address.trim();
  }
  if (typeof PhoneNumber === 'string' && PhoneNumber.trim() !== '') {
    updateFields.PhoneNumber = PhoneNumber.trim();
  }
  if (typeof Avatar === 'string' && Avatar.trim() !== '') {
    updateFields.Avatar = Avatar.trim(); // hoặc URL ảnh được xử lý sẵn
  }
  const updatedUser = await user.update(updateFields);
  return updatedUser;
};
const deleteUser = async userId => {
  return await db.sequelize.transaction(async t => {
    const user = await db.User.findByPk(userId, {
      transaction: t
    });
    if (!user) throw new Error('User not found');

    // Ví dụ: xóa playlist, tracks liên quan (nếu cần)
    await db.Track.destroy({
      where: {
        userId
      },
      transaction: t
    });
    await db.Playlist.destroy({
      where: {
        userId
      },
      transaction: t
    });
    await db.User.destroy({
      where: {
        id: userId
      },
      transaction: t,
      individualHooks: true
    });
    return true;
  });
};
export { getAllUsers, getUserById, createUserService, handleUserLogin, updateUser, deleteUser };