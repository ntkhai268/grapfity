import db from '../models/index.js';
import bcrypt from 'bcrypt';
import { createJWT, verityJWT } from '../middleware/JWTActions.js';

const getAllUsers = async () => {
    return db.User.findAll(); // Lấy tất cả dữ liệu trong bảng User
};

const getUserById = async (id) => {
    return await db.User.findByPk(id); // Lấy dữ liệu của user theo id
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

    return await db.User.create({ email, password, userName, roleId });
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

        return { message: 'Login successful', token: token };
    } catch (err) {
        console.error('Error during login:', err);
        throw new Error('Error checking username');
    }
};

const updateUser = async (id, userName, email, password, roleId) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        password = hashedPassword;
    } catch (err) {
        console.error('Error hashing password:', err);
        throw new Error('Error hashing password');
    }

    const user = await db.User.findByPk(id);
    if (!user) {
        return { message: 'User not found' };
    }

    const updatedUser = await user.update({ userName, email, password, roleId });
    return updatedUser;
};

// ✅ Xuất các hàm theo chuẩn ES module
export {
    getAllUsers,
    getUserById,
    createUser,
    handleUserLogin,
    updateUser,
    // deleteUser (nếu có)
};
