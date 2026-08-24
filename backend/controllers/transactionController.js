const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');         
const Notification = require('../models/Notification'); 
const Account = require('../models/Account');

// 1. دریافت همه تراکنش‌های کاربر (GET)
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).populate('accountId').sort({ date: -1 });
    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطا در دریافت تراکنش‌ها' });
  }
};

// 2. ثبت تراکنش جدید (POST) - همراه با آپدیت موجودی کارت و هشدار بودجه
exports.addTransaction = async (req, res) => {
  try {
    console.log('\n--- 📥 دریافت درخواست ثبت تراکنش جدید ---');
    console.log('📦 بدنه ریکوئست (req.body):', req.body);

    const { title, amount, type, category, date, description, accountId } = req.body;
    const userId = req.user.id;
    const numericAmount = Number(amount);

    if (!accountId) {
      console.log('❌ خطا: فیلد accountId خالی است یا ارسال نشده!');
      return res.status(400).json({ success: false, message: 'انتخاب حساب بانکی الزامی است' });
    }

    // بررسی اینکه آیا حساب متعلق به کاربر هست یا خیر
    const account = await Account.findOne({ _id: accountId, user: userId });
    if (!account) {
      console.log(`❌ خطا: حسابی با شناسه ${accountId} برای این کاربر پیدا نشد!`);
      return res.status(404).json({ success: false, message: 'حساب بانکی مورد نظر یافت نشد' });
    }

    console.log(`✅ حساب مقصد پیدا شد: ${account.name} (موجودی فعلی: ${account.balance})`);

    // ثبت تراکنش در دیتابیس
    const newTransaction = await Transaction.create({
      user: userId,
      accountId,
      title,
      amount: numericAmount,
      type,
      category,
      date: date || Date.now(), 
      description
    });

    // به‌روزرسانی موجودی حساب بر اساس نوع تراکنش
    if (type === 'income') {
      account.balance += numericAmount;
    } else if (type === 'expense') {
      account.balance -= numericAmount;
    }
    await account.save();
    console.log(`✨ موجودی جدید حساب ${account.name} پس از تراکنش ثبت شد: ${account.balance}`);

    // بررسی بودجه و تولید هشدار، فقط اگر تراکنش از نوع هزینه باشد
    if (type === 'expense') {
      const txDate = new Date();
      const year = txDate.getFullYear();
      const month = txDate.getMonth();

      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);

      let budget = await Budget.findOne({ user: userId, year, month, category });
      if (!budget) {
        budget = await Budget.findOne({ user: userId, category: category });
      }

      if (budget && budget.amount > 0) {
        const expensesThisMonth = await Transaction.find({
          user: userId,
          type: 'expense',
          category: category,
          $or: [
            { date: { $gte: startOfMonth, $lte: endOfMonth } },
            { createdAt: { $gte: startOfMonth, $lte: endOfMonth } }
          ]
        });

        const totalSpent = expensesThisMonth.reduce((sum, t) => sum + t.amount, 0);
        const percentage = (totalSpent / budget.amount) * 100;

        if (percentage >= 100) {
          await Notification.create({
            userId: userId,
            title: '⚠️ بحران بودجه!',
            message: `هزینه‌های دسته "${category}" (${totalSpent.toLocaleString()} تومان) از سقف بودجه عبور کرد!`,
            type: 'danger'
          });
        } else if (percentage >= 80) {
          await Notification.create({
            userId: userId,
            title: '🔔 هشدار نزدیک شدن به سقف',
            message: `شما به ${Math.round(percentage)}% از بودجه ماهانه دسته "${category}" رسیده‌اید.`,
            type: 'warning'
          });
        }
      }
    }

    res.status(201).json({ success: true, data: newTransaction });
  } catch (error) {
    console.error('❌ خطا در سیستم ثبت تراکنش:', error);
    res.status(500).json({ success: false, message: 'خطا در ثبت تراکنش', error: error.message });
  }
};

// 3. حذف یک تراکنش (DELETE) - بازگشت مبلغ به حساب
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'تراکنش یافت نشد' });
    }

    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'شما مجاز به حذف این تراکنش نیستید' });
    }

    // بازگرداندن اثر مالی تراکنش به حساب مربوطه
    const account = await Account.findById(transaction.accountId);
    if (account) {
      if (transaction.type === 'income') {
        account.balance -= transaction.amount;
      } else if (transaction.type === 'expense') {
        account.balance += transaction.amount;
      }
      await account.save();
    }

    await transaction.deleteOne();
    res.status(200).json({ success: true, message: 'تراکنش با موفقیت حذف شد' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطا در حذف تراکنش' });
  }
};

// 4. ویرایش یک تراکنش (PUT)
exports.updateTransaction = async (req, res) => {
  try {
    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'تراکنش یافت نشد' });
    }

    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'شما مجاز به ویرایش این تراکنش نیستید' });
    }

    const oldAmount = transaction.amount;
    const oldType = transaction.type;
    const oldAccountId = transaction.accountId.toString();

    const { title, amount, type, category, date, description, accountId } = req.body;
    const newAmount = amount !== undefined ? Number(amount) : oldAmount;
    const newType = type || oldType;
    const newAccountId = accountId || oldAccountId;

    if (oldAccountId === newAccountId) {
      const account = await Account.findById(oldAccountId);
      if (account) {
        if (oldType === 'income') account.balance -= oldAmount;
        else if (oldType === 'expense') account.balance += oldAmount;

        if (newType === 'income') account.balance += newAmount;
        else if (newType === 'expense') account.balance -= newAmount;

        await account.save();
      }
    } else {
      const oldAccount = await Account.findById(oldAccountId);
      if (oldAccount) {
        if (oldType === 'income') oldAccount.balance -= oldAmount;
        else if (oldType === 'expense') oldAccount.balance += oldAmount;
        await oldAccount.save();
      }

      const newAccount = await Account.findById(newAccountId);
      if (newAccount) {
        if (newType === 'income') newAccount.balance += newAmount;
        else if (newType === 'expense') newAccount.balance -= newAmount;
        await newAccount.save();
      }
    }

    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { title, amount: newAmount, type: newType, category, date, description, accountId: newAccountId },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطا در ویرایش تراکنش', error: error.message });
  }
};