const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String, // اگر برای دسته‌بندی‌ها مدل جداگانه‌ای (Category) ساختی، این رو به ObjectId و ref تغییر بده
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true,
        min: [0, 'مبلغ بودجه نمی‌تواند منفی باشد']
    },
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12 // ماه‌های سال
    },
    year: {
        type: Number,
        required: true
    }
}, { timestamps: true });

// 🚀 نکته بسیار مهم: ایجاد ایندکس ترکیبی یکتا
// این خط باعث می‌شه یک کاربر نتونه در یک ماه و سال مشخص، برای یک دسته‌بندی دو تا بودجه متفاوت ثبت کنه.
// اگر بخواد تغییرش بده، همون بودجه قبلی آپدیت می‌شه.
budgetSchema.index({ user: 1, category: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);