const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  // اتصال هر تراکنش به کاربر ثبت‌کننده
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // اتصال تراکنش به حساب یا کارت بانکی مربوطه
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: [true, 'لطفاً حساب یا کارت بانکی مرتبط را انتخاب کنید'],
  },
  // عنوان تراکنش (مثلاً: حقوق خرداد، خرید اینترنت)
  title: {
    type: String,
    required: [true, 'لطفاً عنوان تراکنش را وارد کنید'],
    trim: true,
  },
  // مبلغ
  amount: {
    type: Number,
    required: [true, 'لطفاً مبلغ را وارد کنید'],
  },
  // نوع تراکنش: درآمد یا هزینه
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: [true, 'نوع تراکنش باید مشخص شود'],
  },
  // دسته‌بندی (مثلاً: حقوق، خوراک، حمل و نقل)
  category: {
    type: String,
    required: [true, 'لطفاً دسته‌بندی را مشخص کنید'],
  },
  // تاریخ تراکنش
  date: {
    type: Date,
    default: Date.now,
  },
  // توضیحات اختیاری
  description: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);