import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const protect = async (req, res, next) => {
    const token = req.headers.authorization;
    if(!token){
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
}

const adminProtect = async (req, res, next) => {
    const token = req.headers.authorization;
    if(!token){
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.userId);

        if(!user || user.role !== 'admin'){
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        req.userId = decoded.userId;
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
}

export { protect, adminProtect };
export default protect;