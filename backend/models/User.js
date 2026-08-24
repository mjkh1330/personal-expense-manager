const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'لطفاً نام خود را وارد کنید'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'لطفاً ایمیل خود را وارد کنید'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'لطفاً یک ایمیل معتبر وارد کنید',
      ],
    },
    password: {
      type: String,
      required: [true, 'لطفاً رمز عبور را وارد کنید'],
      minlength: [6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'],
    },
    currency: {
      type: String,
      enum: ['IRT', 'IRR', 'تومان', 'ریال'],
      default: 'IRT',
    },
  },
  {
    timestamps: true,
  }
);

// هش کردن رمز عبور قبل از ذخیره در دیتابیس
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// متد مقایسه رمز عبور
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);