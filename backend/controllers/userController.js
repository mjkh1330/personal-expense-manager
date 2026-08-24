// backend/controllers/userController.js
const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
const getUserProfile = async (req, res) => {
  try {
    // گرفتن اطلاعات کاربر بر اساس ID موجود در توکن (بدون پسورد)
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'کاربر یافت نشد' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'خطای سرور در دریافت اطلاعات' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      // آپدیت نام و واحد پولی (اگر در درخواست نبودن، همون مقدار قبلی میمونه)
      user.name = req.body.name || user.name;
      user.currency = req.body.currency || user.currency;

      // اگر کاربر رمز جدید فرستاده بود، فقط کافیه جایگذاریش کنیم
      // خود Mongoose به لطف متد pre('save') که نوشتی، اون رو هش می‌کنه
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        currency: updatedUser.currency,
        message: 'پروفایل با موفقیت به‌روزرسانی شد'
      });
    } else {
      res.status(404).json({ message: 'کاربر یافت نشد' });
    }
  } catch (error) {
    res.status(500).json({ message: 'خطای سرور در به‌روزرسانی پروفایل' });
  }
};

module.exports = { getUserProfile, updateUserProfile };