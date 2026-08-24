const Notification = require('../models/Notification');

// دریافت تمام نوتیفیکیشن‌های کاربر
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 }) // جدیدترین‌ها بالا قرار بگیرند
            .limit(20); // آخرین ۲۰ نوتیفیکیشن
        
        // تعداد نوتیفیکیشن‌های خوانده نشده
        const unreadCount = await Notification.countDocuments({ 
            userId: req.user._id, 
            isRead: false 
        });

        res.status(200).json({ success: true, notifications, unreadCount });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطا در دریافت نوتیفیکیشن‌ها', error: error.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.findOneAndUpdate(
            { _id: id, userId: req.user._id },
            { isRead: true }
        );
        res.status(200).json({ success: true, message: 'نوتیفیکیشن خوانده شد' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطا در به‌روزرسانی نوتیفیکیشن', error: error.message });
    }
};

// علامت‌زدن همه به عنوان خوانده شده
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user._id, isRead: false },
            { isRead: true }
        );
        res.status(200).json({ success: true, message: 'همه نوتیفیکیشن‌ها خوانده شدند' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطا در به‌روزرسانی نوتیفیکیشن‌ها', error: error.message });
    }
};