import db from '../models/index.js';
import bcrypt from 'bcrypt';
import { createJWT, verityJWT } from '../middleware/JWTActions.js';

const getAllUsers = async () => {
    return db.User.findAll(); // Lấy tất cả dữ liệu trong bảng User
};
//dùng để 2 user coi profile của nhau
const getUserByIdPublic = async (id) => {
  try {
    return await db.User.findByPk(id, {
      attributes: ['id', 'userName', 'Name', 'Avatar', 'createdAt']
    });
  } catch (error) {
    console.error(`Lỗi khi tìm user (public) với id ${id}:`, error);
    throw new Error('Không thể truy cập dữ liệu người dùng công khai');
  }
};
// dùng để uer coi profile của chính mình
const getUserByIdProfile = async (id) => {
  try {
    return await db.User.findByPk(id, {
      attributes: [
        'id', 'userName', 'Name', 'Avatar', 'email',
        'Birthday', 'Address', 'PhoneNumber', 'password'
      ]
    });
  } catch (error) {
    console.error(`Lỗi khi tìm user (full) với id ${id}:`, error);
    throw new Error('Không thể truy cập dữ liệu đầy đủ của người dùng');
  }
};

// của khôi
const getUserById = async (id) => {
    try {
        const user = await db.User.findByPk(id);
        return user;
    } catch (error) {
        console.error(`Lỗi khi tìm user với id ${id}:`, error);
        throw new Error('Không thể truy cập dữ liệu người dùng');
    }
};



const createUser = async (userName, email, password, roleId) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        password = hashedPassword;
    } catch (err) {
        console.error('Error hashing password:', err);
        throw new Error('Error hashing password');
    }

    try {
        const user = await db.User.findOne({ where: { email } });
        if (user) {
            return { message: 'Email already exists' };
        }
    } catch (err) {
        console.error('Error checking email:', err);
        throw new Error('Error checking email');
    }

    try {
        const userNameExists = await db.User.findOne({ where: { userName } });
        if (userNameExists) {
            return { message: 'Username already exists' };
        }
    } catch (err) {
        console.error('Error checking username:', err);
        throw new Error('Error checking username');
    }

    const newUser = await db.User.create({ email, password, userName, roleId });
    const payload = { userId: newUser.id };
    const token = createJWT(payload);
    return { message: 'Register successful', token: token };

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

const deleteUser = async (userId) => {
    return await db.User.destroy({ where: { id: userId }, individualHooks: true})
}

export {
    getAllUsers,
    getUserByIdPublic,
    getUserByIdProfile,
    getUserById,
    createUser,
    handleUserLogin,
    updateUser,
    deleteUser
};
