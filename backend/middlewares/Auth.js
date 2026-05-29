import User from '../models/User.js';
import jwt from 'jsonwebtoken';
// Align JWT secret handling with controllers to avoid dev crashes
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'dev_jwt_secret_change_me' : undefined);
export const userAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }
        if (!JWT_SECRET) {
            console.error('JWT_SECRET is not set. Configure it in the environment.');
            return res.status(500).json({ success: false, message: 'Server configuration error' });
        }
        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }
        if (!req) {
            throw new Error('Request object is undefined');
        }
        req.user = user;  
        req.userId = user._id;  
        
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ success: false, message: 'Please authenticate' });
    }
}
