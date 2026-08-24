const Transaction = require('../models/Transaction'); // مسیر مدل خودت رو چک کن
const mongoose = require('mongoose');

// @desc    Get dashboard analytics (Charts data)
// @route   GET /api/transactions/analytics
// @access  Private (فقط کاربران لاگین شده)
const getAnalytics = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id); // آیدی کاربری که از کوکی/توکن اومده

    // ۱. داده‌های نمودار دایره‌ای: جمع هزینه‌ها به تفکیک دسته‌بندی
    const expensesByCategory = await Transaction.aggregate([
      { 
        $match: { 
          user: userId, 
          type: 'expense' // فقط هزینه‌ها رو می‌خوایم
        } 
      },
      { 
        $group: { 
          _id: '$category', 
          totalAmount: { $sum: '$amount' } 
        } 
      },
      { $sort: { totalAmount: -1 } } // مرتب‌سازی از بیشترین به کمترین هزینه
    ]);

    // ۲. داده‌های نمودار خطی/ستونی: مقایسه درآمد و هزینه در ماه‌های مختلف
    const monthlyTrend = await Transaction.aggregate([
      { 
        $match: { user: userId } 
      },
      {
        $group: {
          // گروه‌بندی بر اساس سال و ماه
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          // اگر نوع تراکنش 'income' بود، مبلغ رو جمع بزن، در غیر این صورت ۰
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
            }
          },
          // اگر نوع تراکنش 'expense' بود، مبلغ رو جمع بزن، در غیر این صورت ۰
          totalExpense: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
            }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } } // مرتب‌سازی زمانی از قدیم به جدید
    ]);

    res.status(200).json({
      success: true,
      data: {
        expensesByCategory,
        monthlyTrend
      }
    });

  } catch (error) {
    console.error('Error in getAnalytics:', error);
    res.status(500).json({ success: false, message: 'خطا در دریافت اطلاعات تحلیل نموداری' });
  }
};

module.exports = {
  getAnalytics
};