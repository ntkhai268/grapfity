const db = require('../models')
const { getAllTracks, getTrackById, createTrack, updateTrack, deleteTrack, getTrackWithUploaderById } = require('../services/track_service') //import các hàm từ file track_service.js

const getAllTracksController = async (req, res) => {
    try {
        const tracks = await getAllTracks(); //lấy tất cả dữ liệu trong bảng Track
        return res.status(200).json({
            message: 'Get all tracks succeed!',
            data: tracks //trả về dữ liệu của track cần update
        })
    } catch (err) {
        console.error('Database connection failed:', err) //log lỗi ra console
        res.status(500).send('Internal Server Error') //gửi lỗi 500 về client
    }
}

const getTrackByIdController = async (req, res) => {
    try {
        const track = await getTrackById(req.params.id); //lấy dữ liệu của track theo id
        if (!track) {
            return res.status(404).json({
                message: 'Track not found'
            })
        }
        return res.status(200).json({
            message: 'Get track succeed!',
            data: track //trả về dữ liệu của track cần update
        })
    } catch (err) {
        console.error('Database connection failed:', err) //log lỗi ra console
        res.status(500).send('Internal Server Error') //gửi lỗi 500 về client
    }
}

const getTrackWithUploaderByIdController = async (req, res) => {
    try {
        const track = await getTrackWithUploaderById(req.params.id); //lấy dữ liệu của track theo id
        if (!track) {
            return res.status(404).json({
                message: 'Track not found'
            })
        }
        return res.status(200).json({
            message: 'Get track succeed!',
            data: track //trả về dữ liệu của track cần update
        })
    } catch (err) {
        console.error('Database connection failed:', err) //log lỗi ra console
        res.status(500).send('Internal Server Error') //gửi lỗi 500 về client
    }
}

const createTrackController = async (req, res) => {
    let { trackUrl, imageUrl, uploaderId } = req.body //lấy các giá trị từ body của request
    if (!trackUrl || !imageUrl || !uploaderId) {
        return res.status(400).json({
            message: 'Missing required fields'
        })
    }
    try {
        const newTrack = await createTrack(trackUrl, imageUrl, uploaderId); //tạo mới track
        return res.status(200).json({
            message: 'Create track succeed!',
            data: newTrack //trả về dữ liệu của track vừa tạo
        })
    } catch (err) {
        console.error('Database connection failed:', err) //log lỗi ra console
        res.status(500).send('Internal Server Error') //gửi lỗi 500 về client
    }
}

const updateTrackController = async (req, res) => {
    let { id, trackUrl, imageUrl, uploaderId } = req.body //lấy các giá trị từ body của request
    if (!id || !trackUrl || !imageUrl || !uploaderId) {
        return res.status(400).json({
            message: 'Missing required fields'
        })
    }
    try {
        const updatedTrack = await updateTrack(id, { trackUrl, imageUrl, uploaderId }); //cập nhật track
        return res.status(200).json({
            message: 'Update track succeed!',
            data: updatedTrack //trả về dữ liệu của track vừa cập nhật
        })
    } catch (err) {
        console.error('Database connection failed:', err) //log lỗi ra console
        res.status(500).send('Internal Server Error') //gửi lỗi 500 về client
    }
}

const deleteTrackController = async (req, res) => {
    //còn deleteTrack chưa làm, viết sau
}

module.exports = {
    getAllTracksController,
    getTrackByIdController,
    getTrackWithUploaderByIdController,
    createTrackController,
    updateTrackController,
    deleteTrackController
}
