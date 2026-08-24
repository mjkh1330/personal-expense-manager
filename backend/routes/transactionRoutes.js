const express = require('express');
const router = express.Router();

const { 
  getTransactions, 
  addTransaction, 
  deleteTransaction, 
  updateTransaction 
} = require('../controllers/transactionController');

//  ۱. ایمپورت کنترلر تحلیل نموداری (اضافه شد)
const { getAnalytics } = require('../controllers/analyticsController'); 

const { protect } = require('../middleware/auth'); 

//  ۲. اضافه کردن روت تحلیل نموداری (خیلی مهم: حتماً بالای /:id باشه)
router.get('/analytics', protect, getAnalytics);

// استفاده از protect برای محافظت از مسیرها
router.route('/')
  .get(protect, getTransactions)   
  .post(protect, addTransaction);  

router.route('/:id')
  .delete(protect, deleteTransaction)
  .put(protect, updateTransaction);

module.exports = router;