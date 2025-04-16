const db = require('../models')
const { getAllUsers, createUser, handleUserLogin, updateUser } = require('../services/user_service')

const getAllUsersController = async (req, res) => {
    try{
        const data = await getAllUsers()
        return res.status(200).json({
            message: 'ok',
            data: data
        })
    }catch (err) {
        console.error('Database connection failed:', err) //log lỗi ra console
        res.status(500).send('Internal Server Error') //gửi lỗi 500 về client
    }
}

const createUserController = async (req, res) => {
    try {
        const { username, password, email, roleid } = req.body //lấy các giá trị từ body của request  
        const data = await createUser(username, email, password, roleid) //gọi hàm createUser để tạo người dùng mới
        return res.status(200).json(data)
    } catch (err) {
        console.error('Database connection failed:', err) //log lỗi ra console
        res.status(500).send('Internal Server Error') //gửi lỗi 500 về client
    }
}

const handleUserLoginController = async (req, res) => {
    const { username , password } = req.body //lấy các giá trị từ body của request  
    const data = await handleUserLogin(username, password) //gọi hàm handleUserLogin để kiểm tra thông tin đăng nhập
    return res.status(200).json(data)
}

const updateUserController = async (req, res) => {
    const { id } = req.params //lấy id từ params của request  
    console.log('updateUserData', id)
    const updateUserData = req.body //lấy các giá trị từ body của request
    try{
        
        const data = await updateUser(id, updateUserData.userName, updateUserData.email, updateUserData.password, updateUserData.roleId) //gọi hàm updateUser để cập nhật thông tin người dùng
        return res.status(200).json(data)
    }
    catch (err) {
        console.error('Database connection failed:', err) //log lỗi ra console
        res.status(500).send('Internal Server Error') //gửi lỗi 500 về client
    }
}
module.exports = {
    getAllUsersController,
    // getUserByIdController,
    createUserController,
    handleUserLoginController,
    updateUserController
    // deleteUserController
}