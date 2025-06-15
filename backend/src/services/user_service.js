import db from '../models/index.js';
import bcrypt from 'bcrypt';
import { createJWT, verityJWT } from '../middleware/JWTActions.js';

const getAllUsers = async () => {
    return db.User.findAll(); // Lấy tất cả dữ liệu trong bảng User
};

const getUserById = async (id, isSelf = false) => {
  try {
    const attributes = isSelf
      ? [ 'id', 'userName', 'Name', 'Avatar', 'email', 'Birthday', 'Address', 'PhoneNumber', 'password' ]
      : [ 'id', 'userName', 'Name', 'Avatar', 'createdAt' ];

    const user = await db.User.findByPk(id, { attributes });

    if (user && isSelf) {
      const { password, refreshToken, ...safeUser } = user.dataValues;
      return safeUser;
    }

    return user;
  } catch (error) {
    console.error(`Lỗi khi tìm user với id ${id}:`, error);
    throw new Error('Không thể truy cập dữ liệu người dùng');
  }
};



const createUserService = async (payload) => {
  try {
    // 1. Kiểm tra email đã tồn tại chưa
    const existingEmail = await db.User.findOne({ where: { email: payload.email } });
    if (existingEmail) {
      return { message: 'Email already exists' };
    }

    // 2. Kiểm tra userName đã tồn tại chưa
    const existingUserName = await db.User.findOne({ where: { userName: payload.userName } });
    if (existingUserName) {
      return { message: 'Username already exists' };
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
        const user = await db.User.findOne({ where: { userName: username } });

        if (!user) {
            return { message: 'Username does not exist' };
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return { message: 'Incorrect password' };
        }

        const payload = { userId: user.id };
        const token = createJWT(payload);

        return { message: 'Login successful', token: token, roleId: user.roleId };
    } catch (err) {
        console.error('Error during login:', err);
        throw new Error('Error checking username');
    }
};

const updateUserService = async (
    id,
    userName,
    email,
    password,
    roleId,
    Name,
    Birthday,
    Address,
    PhoneNumber
  ) => {
    // Tìm user theo khóa chính
    const user = await db.User.findByPk(id);
    if (!user) return null;
  
    // Xây dựng đối tượng cập nhật
    const updateData = {
      userName,
      email,
      roleId,
      Name,
      Birthday,
      Address,
      PhoneNumber
    };
  
    // Nếu có password mới, hash rồi gán vào updateData
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
  
    // Thực hiện cập nhật
    await user.update(updateData);
    return user;
  };

const deleteUser = async (id) => {
    return await db.sequelize.transaction(async (t) => {
    const user = await db.User.findByPk(id, { transaction: t });
    if (!user) throw new Error('User not found');

    // Ví dụ: xóa playlist, tracks liên quan (nếu cần)
    await db.Track.destroy({ where: { id }, transaction: t });
    await db.Playlist.destroy({ where: { id }, transaction: t });

    await db.User.destroy({
      where: { id: id },
      transaction: t,
      individualHooks: true,
    });

    return true;
  });
  };


export {
    getAllUsers,
    getUserById,
    createUserService,
    handleUserLogin,
    updateUserService,
    deleteUser
};
