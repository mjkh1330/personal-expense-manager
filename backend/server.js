const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cookieParser());

// دامنه‌های مجاز برای ارتباط با سرور
const allowedOrigins = [
  'https://effortless-biscuit-1e53da.netlify.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend is running smoothly' });
});

// --- مسیرهای API ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes')); 
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/accounts', require('./routes/accountRoutes')); 
app.use('/api/categories', require('./routes/categoryRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});