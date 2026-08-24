const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  // دریافت توکن از کوکی یا هدر Authorization
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'دسترسی غیرمجاز؛ لطفاً وارد شوید.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret_key');
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'کاربر مربوط به این توکن یافت نشد.' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'توکن نامعتبر یا منقضی شده است.' });
  }
};