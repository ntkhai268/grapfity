import { v2 as cloudinary } from 'cloudinary';

// Cấu hình Cloudinary
cloudinary.config({ 
    cloud_name: 'dlecaearb', 
    api_key: '256713197814828', 
    api_secret: 'AnKUAVYnGvrV-H07QzOkF1b--i0' 
});

export default cloudinary;  // Đổi từ module.exports thành export default
