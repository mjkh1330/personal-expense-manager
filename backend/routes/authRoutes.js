const express = require('express');
const router = express.Router();
const { register, login, getMe, logout } = require('../controllers/authController');
// وارد کردن توابع کنترلر پروفایل
const { getUserProfile, updateUserProfile } = require('../controllers/userController'); 
const { protect } = require('../middleware/auth');

// مسیرهای احراز هویت
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', logout);

// مسیرهای پروفایل کاربر (اضافه شده برای فاز ۴)
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

module.exports = router;