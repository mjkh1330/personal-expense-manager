const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'نام حساب یا کارت الزامی است'],
        trim: true
    },
    type: {
        type: String,
        enum: ['bank_account', 'credit_card', 'cash', 'savings'],
        default: 'bank_account'
    },
    balance: {
        type: Number,
        required: true,
        default: 0
    },
    cardNumber: {
        type: String, 
        required: [true, 'وارد کردن ۴ رقم آخر کارت الزامی است'],
        minlength: [4, '۴ رقم کارت باید دقیقاً ۴ رقم باشد'],
        maxlength: [4, '۴ رقم کارت باید دقیقاً ۴ رقم باشد'],
        trim: true
    },
    color: {
        type: String, // برای رنگ کارت در UI
        default: '#3b82f6'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Account', accountSchema);