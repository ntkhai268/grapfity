import db from '../models/index.js';
import {
    getAllUsers,
    createUser,
    handleUserLogin,
    updateUser
} from '../services/user_service.js';

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
    const { username } = req.body;  // Chỉ cần username

    try {
        // Kiểm tra xem tài khoản có tồn tại không
        const user = await db.User.findOne({ where: { userName: username } });

        // Nếu tài khoản không tồn tại, trả về lỗi
        if (!user) {
            return res.status(400).json({ error: 'Tài khoản không tồn tại' });
        }

        // Nếu tài khoản tồn tại, trả về roleId
        const roleId = user.roleId;  // Trả về roleId của người dùng

        // Trả về roleId cho frontend
        return res.status(200).json({ message: 'Đăng nhập thành công', roleId: roleId });

    } catch (err) {
        console.error('Lỗi khi đăng nhập:', err);
        return res.status(500).json({ error: 'Đã có lỗi xảy ra khi xử lý yêu cầu đăng nhập.' });
    }
};



const updateUserController = async (req, res) => {
    const { id } = req.params;
    console.log('updateUserData', id);
    const updateUserData = req.body;
    try {
        const data = await updateUser(
            id,
            updateUserData.userName,
            updateUserData.email,
            updateUserData.password,
            updateUserData.roleId
        );
        return res.status(200).json(data);
    } catch (err) {
        console.error('Database connection failed:', err);
        res.status(500).send('Internal Server Error');
    }
};

// ✅ Xuất theo chuẩn ES module
export {
    getAllUsersController,
    createUserController,
    handleUserLoginController,
    updateUserController
    // deleteUserController, getUserByIdController nếu bạn thêm sau
};
