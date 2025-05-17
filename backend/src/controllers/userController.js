import db from '../models/index.js';
import {
    getAllUsers,
    createUserService ,
    getUserById,      
    handleUserLogin,
    updateUserService,
    deleteUser as deleteUserService
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

const registerController = async (req, res) => {
  try {
    const {
      userName,
      email,
      password,
      roleId,       // Bắt buộc cung cấp
      Name,
      Birthday,
      Address,
      PhoneNumber
    } = req.body;

    // Validate các trường bắt buộc
    if (!userName || !email || !password || roleId === undefined) {
      return res
        .status(400)
        .json({ message: 'userName, email, password và roleId là bắt buộc' });
    }

    // Gọi service tạo user
    const result = await createUserService({
      userName,
      email,
      password,
      roleId,
      Name,
      Birthday,
      Address,
      PhoneNumber
    });

    // Nếu service trả về thông báo lỗi
    if (result.message === 'Email already exists') {
      return res.status(409).json({ message: 'Email đã tồn tại' });
    }
    if (result.message === 'Username already exists') {
      return res.status(409).json({ message: 'Username đã tồn tại' });
    }

    // Ngược lại, tạo thành công
    return res.status(201).json({
      message: 'Đăng ký thành công',
      data: result
    });
  } catch (err) {
    console.error('registerController error:', err);
    return res.status(500).json({ message: 'Lỗi máy chủ' });
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
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    // Lấy tất cả các field từ body, bao gồm password
    const {
      userName,
      email,
      password,
      roleId,
      Name,
      Birthday,
      Address,
      PhoneNumber
    } = req.body;

    const updatedUser = await updateUserService(
      id,
      userName,
      email,
      password,
      roleId,
      Name,
      Birthday,
      Address,
      PhoneNumber
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Trả về user đã được cập nhật (bao gồm password đã hash)
    return res.status(200).json({
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (err) {
    console.error('updateUserController error:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// DELETE /api/users/:id
const deleteUserController = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    const rows = await deleteUserService(id);
    if (rows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ message: 'User deleted' });
  } catch (err) {
    console.error('deleteUserController error:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
const getUserByIdController = async (req, res) => {
  try {
    // 1. Đọc token từ cookie
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    // 2. Giải mã JWT để lấy payload (userId)
    const decoded = verityJWT(token);  
    const userId = decoded.userId;

    // 3. Gọi service
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 4. Trả về thông tin user
    return res.status(200).json({ message: 'ok', data: user });
  } catch (err) {
    console.error('getUserByIdController error:', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
export {
    getAllUsersController,
    registerController,
    handleUserLoginController,
    getUserByIdController,  
    updateUserController,
    deleteUserController
};
