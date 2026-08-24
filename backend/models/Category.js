// models/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'نام دسته‌بندی الزامی است'],
    trim: true
  },
  type: {
    type: String,
    enum: ['expense', 'income'], // مشخص می‌کند دسته برای هزینه است یا درآمد
    required: true
  },
  icon: {
    type: String,
    default: 'default-icon'
  },
  color: {
    type: String,
    default: '#3b82f6'
  }
}, { timestamps: true });

// جلوگیری از ثبت نام تکراری برای یک نوع مشخص توسط یک کاربر خاص
categorySchema.index({ user: 1, name: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);