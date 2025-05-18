import db from '../models/index.js';
import bcrypt from 'bcrypt';
import {
    getAllUsers,
    getUserById,
    createUser,
    handleUserLogin,
    updateUser,
    deleteUser
} from '../services/user_service.js';
import { verityJWT } from '../middleware/JWTActions.js';


const getAllUsersController = async (req, res) => {
    try {
        const data = await getAllUsers();
        return res.status(200).json({
            message: 'ok',
            data: data
        });
    } catch (err) {
        console.error('Database connection failed:', err);
        res.status(500).send('Internal Server Error');
    }
};
// coi profile người khác thì dùng cái này
const getUserByIdController = async (req, res) => {
    try {
        const { id } = req.params;

        // --- VALIDATION ---
        if (!id || isNaN(Number(id))) {
            return res.status(400).json({ error: 'Bad Request: ID người dùng không hợp lệ.' });
        }

        // --- SERVICE CALL ---
        const user = await getUserById(Number(id));
        if (!user) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
        }

        // --- RESPONSE ---
        return res.status(200).json({
            message: 'Lấy thông tin người dùng thành công!',
            data: user
        });

    } catch (error) {
        console.error(`Lỗi trong getUserByIdController với id ${req.params?.id}:`, error);
        return res.status(500).json({ error: 'Lỗi server khi lấy thông tin người dùng.' });
    }
};

// com tự coi profile của mình thì dùng cái này:
const getMyProfileController = async (req, res) => {
    try {
        const userId = req.userId; // từ middleware gắn sau khi decode JWT

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized: Yêu cầu đăng nhập.' });
        }

        const user = await getUserById(userId); 
        if (!user) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
        }

        const { password, refreshToken, ...safeUserData } = user.dataValues;

        return res.status(200).json({
            message: 'Lấy thông tin cá nhân thành công!',
            data: safeUserData
        });

    } catch (error) {
        console.error(`Lỗi trong getMyProfileController:`, error);
        return res.status(500).json({ error: 'Lỗi server khi lấy thông tin người dùng.' });
    }
};


const createUserController = async (req, res) => {
    try {
        const { username, password, email, roleid } = req.body;
        const data = await createUser(username, email, password, roleid);
        return res.status(200).json(data);
    } catch (err) {
        console.error('Database connection failed:', err);
        res.status(500).send('Internal Server Error');
    }
};

const handleUserLoginController = async (req, res) => {
    console.log(req.cookies);
    const { username, password } = req.body;
    const data = await handleUserLogin(username, password);
    res.cookie('jwt', data.token, { httpOnly: true, maxAge: 60 * 60 * 1000 });
    return res.status(200).json(data);
};



const updateUserController = async (req, res) => {
    try {
        const userId = req.userId;

        // Lấy dữ liệu từ req.body (text field)
        const {
            userName,
            email,
            password,
            Name,
            Birthday,
            Address,
            PhoneNumber
        } = req.body;

        // Lấy file ảnh nếu có (gửi từ FormData)
        const Avatar = req.file ? `/assets/user_image/${req.file.filename}` : undefined;

        const updatedUser = await updateUser(userId, {
            userName,
            email,
            password,
            Name,
            Birthday,
            Address,
            PhoneNumber,
            Avatar
        });

        return res.status(200).json({
            message: 'Cập nhật thông tin thành công!',
            data: updatedUser
        });
    } catch (err) {
        console.error('Lỗi khi cập nhật thông tin:', err.message, err.stack);
        return res.status(500).json({ message: 'Lỗi server.' });
    }
};



const deleteUserController = async(req, res) => {
    const JWT = req.cookies;
    const data = verityJWT(JWT.jwt);
    const userId = data.userId;
    console.log(userId)
    try{
        await deleteUser(userId);
        res.cookie('jwt', '');
        return res.status(200).json({
            message: 'Delete user succeed!',
        });
    } catch (err) {
        console.error('Database connection failed:', err);
        res.status(500).send('Internal Server Error');
    }
}


const logoutController = (req, res) => {
  res.clearCookie('jwt'); // tên cookie bạn đang dùng
  req.session?.destroy?.(); // nếu dùng session
  res.status(200).json({ message: 'Đăng xuất thành công' });
};


const verifyPasswordController = async (req, res) => {
  try {
    const userId = req.userId; // ✅ từ middleware authenticateUser
    const { password } = req.body;
        console.log("✅ [verify-password] userId:", userId);
    console.log("✅ [verify-password] password received:", password);

    if (!password) {
      return res.status(400).json({ valid: false, message: 'Thiếu mật khẩu cần xác minh.' });
    }

    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ valid: false, message: 'Không tìm thấy người dùng.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    return res.status(200).json({ valid: isMatch });
  } catch (error) {
    console.error('Lỗi xác thực mật khẩu:', error);
    return res.status(500).json({ valid: false, message: 'Lỗi máy chủ khi xác thực mật khẩu.' });
  }
};
export {
    getAllUsersController,
    getUserByIdController,
    getMyProfileController,
    createUserController,
    handleUserLoginController,
    updateUserController,
    deleteUserController,
    logoutController,
    verifyPasswordController
};
