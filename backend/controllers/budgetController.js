const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction'); 

// ۱. تنظیم یا به‌روزرسانی بودجه یک دسته‌بندی
const setBudget = async (req, res) => {
    try {
        const { category, amount, month, year } = req.body;
        const userId = req.user.id; 

        const budget = await Budget.findOneAndUpdate(
            { user: userId, category, month, year },
            { amount },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({ success: true, data: budget });
    } catch (error) {
        console.error("DEBUG ERROR:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ۲. دریافت وضعیت بودجه‌ها
const getBudgetsStatus = async (req, res) => {
    try {
        const { month, year } = req.query; 
        const userId = req.user.id;

        const budgets = await Budget.find({ user: userId, month, year });
        const currentMonthTransactions = await Transaction.find({ 
            user: userId,
            type: 'expense' 
        });

        const budgetStatus = budgets.map(budget => {
            const categoryExpenses = currentMonthTransactions.filter(
                tx => tx.category === budget.category
            );
            const totalSpent = categoryExpenses.reduce((sum, tx) => sum + tx.amount, 0);
            const percentageUsed = budget.amount > 0 ? (totalSpent / budget.amount) * 100 : 0;

            return {
                _id: budget._id,
                category: budget.category,
                limitAmount: budget.amount,
                spentAmount: totalSpent,
                remainingAmount: budget.amount - totalSpent,
                percentage: Math.min(percentageUsed, 100).toFixed(1), 
                isExceeded: totalSpent > budget.amount 
            };
        });

        res.status(200).json({ success: true, data: budgetStatus });
    } catch (error) {
        console.error("Get Budgets Error:", error);
        res.status(500).json({ success: false, message: 'خطا در دریافت وضعیت بودجه‌ها' });
    }
};

// ۳. حذف بودجه
const deleteBudget = async (req, res) => {
    try {
        await Budget.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'بودجه با موفقیت حذف شد' });
    } catch (error) {
        console.error("Delete Budget Error:", error);
        res.status(500).json({ success: false, message: 'خطا در حذف بودجه' });
    }
};

// اکسپورت به صورت آبجکت
module.exports = {
    setBudget,
    getBudgetsStatus,
    deleteBudget
};