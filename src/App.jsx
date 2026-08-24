import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics'; 
import Budget from './pages/Budget'; 
import Accounts from './pages/Accounts';
import Categories from './pages/Categories'; // 📁 صفحه دسته‌بندی‌های سفارشی

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            {/* مسیرهای عمومی */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* مسیرهای محافظت‌شده */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/analytics" element={<Analytics />} /> 
              <Route path="/budget" element={<Budget />} /> 
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/categories" element={<Categories />} /> {/* 💳 روت جدید */}
            </Route>

            {/* هدایت مسیرهای ناشناخته */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;