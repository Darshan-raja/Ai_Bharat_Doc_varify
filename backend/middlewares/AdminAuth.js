import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'dev_jwt_secret_change_me' : undefined);

export const adminAuth = (req, res, next) => {
  try {
    const token = req.cookies.adminToken || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, message: 'Admin token not provided' });
    }

    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not set. Configure it in the environment.');
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized as admin' });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    console.error('Admin auth error:', error.message);
    return res.status(401).json({ success: false, message: 'Invalid or expired admin token' });
  }
};
