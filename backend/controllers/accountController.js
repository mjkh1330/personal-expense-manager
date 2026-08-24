const Account = require('../models/Account');

// دریافت تمام حساب‌های کاربر
exports.getAccounts = async (req, res) => {
    try {
        const accounts = await Account.find({ user: req.user._id });
        res.status(200).json({ success: true, data: accounts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ایجاد حساب یا کارت جدید
exports.createAccount = async (req, res) => {
    try {
        const { name, type, balance, cardNumber, color } = req.body;
        
        // بررسی اینکه آیا ۴ رقم کارت وارد شده است یا خیر
        if (!cardNumber || cardNumber.trim().length !== 4) {
            return res.status(400).json({ 
                success: false, 
                message: 'وارد کردن دقیقاً ۴ رقم آخر کارت الزامی است.' 
            });
        }

        // بررسی اینکه آیا کارتی با این ۴ رقم قبلاً برای این کاربر ثبت شده است یا خیر
        const existingCard = await Account.findOne({ 
            user: req.user._id, 
            cardNumber: cardNumber.trim() 
        });

        if (existingCard) {
            return res.status(400).json({ 
                success: false, 
                message: 'کارتی با این ۴ رقم آخر قبلاً ثبت شده است. لطفاً شماره دیگری وارد کنید.' 
            });
        }

        const newAccount = await Account.create({
            user: req.user._id,
            name,
            type,
            balance: balance || 0,
            cardNumber: cardNumber.trim(),
            color
        });

        res.status(201).json({ success: true, data: newAccount });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// حذف حساب
exports.deleteAccount = async (req, res) => {
    try {
        const account = await Account.findOneAndDelete({ 
            _id: req.params.id, 
            user: req.user._id 
        });

        if (!account) {
            return res.status(404).json({ success: false, message: 'حساب مورد نظر یافت نشد' });
        }

        res.status(200).json({ success: true, message: 'حساب با موفقیت حذف شد' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};