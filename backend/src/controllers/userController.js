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
    console.log(req.cookies);
    const { username, password } = req.body;
    const data = await handleUserLogin(username, password);
    res.cookie('jwt', data.token, { httpOnly: true, maxAge: 60 * 60 * 1000 });
    return res.status(200).json(data);
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
