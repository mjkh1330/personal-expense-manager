const express = require('express');
const router = express.Router();

// ۱. مطمئن شو که deleteBudget حتماً از کنترلر ایمپورت شود
const { setBudget, getBudgetsStatus, deleteBudget } = require('../controllers/budgetController');
const { protect } = require('../middleware/auth'); 

router.post('/', protect, setBudget);
router.get('/status', protect, getBudgetsStatus);

// ۲. این خط حیاتی باید حتماً اینجا باشد تا درخواست DELETE را بفهمد
router.delete('/:id', protect, deleteBudget);

module.exports = router;