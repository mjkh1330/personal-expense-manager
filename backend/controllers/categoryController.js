// controllers/categoryController.js
const Category = require('../models/Category');

// دریافت تمام دسته‌بندی‌های کاربر
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user._id });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ایجاد دسته‌بندی سفارشی جدید
exports.createCategory = async (req, res) => {
  try {
    const { name, type, icon, color } = req.body;

    const newCategory = await Category.create({
      user: req.user._id,
      name,
      type,
      icon,
      color
    });

    res.status(201).json({ success: true, data: newCategory });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'این دسته‌بندی قبلاً ثبت شده است.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// حذف دسته‌بندی سفارشی
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!category) {
      return res.status(404).json({ success: false, message: 'دسته‌بندی یافت نشد.' });
    }

    await category.deleteOne();
    res.status(200).json({ success: true, message: 'دسته‌بندی با موفقیت حذف شد.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};