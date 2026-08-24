// routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getCategories, 
  createCategory, 
  deleteCategory 
} = require('../controllers/categoryController');
const { protect } = require('../middleware/auth'); // میدلور احراز هویت پروژه شما

router.route('/')
  .get(protect, getCategories)
  .post(protect, createCategory);

router.route('/:id')
  .delete(protect, deleteCategory);

module.exports = router;