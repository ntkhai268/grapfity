import { verityJWT } from './JWTActions.js'

const authenticateUser = (req, res, next) =>{
    console.log('ahihi')
    const token = req.cookies.jwt;
    if (!token){
        return res.status(401).json({ error: 'Chưa đăng nhập hoặc token không tồn tại' });
    }

    try{
        const decode = verityJWT(token);
        next();
    } catch(err){
        return res.status(403).json({ error: 'Token không hợp lệ hoặc hết hạn' });
    }
}

export { authenticateUser }