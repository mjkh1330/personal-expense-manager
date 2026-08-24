const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');

// وارد کردن میدل‌ور احراز هویت با نام و مسیر درست
const { protect } = require('../middleware/auth'); 

// تمام این مسیرها نیاز به لاگین دارند، پس از تابع protect استفاده می‌کنیم
router.use(protect);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);

module.exports = router;