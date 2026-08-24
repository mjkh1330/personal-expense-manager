import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : 'http://localhost:5000/api';

const Budget = () => {
  const { colors, isDarkMode } = useTheme();
  
  const [budgets, setBudgets] = useState([]);
  const [budgetForm, setBudgetForm] = useState({
    category: 'خوراک و سوپرمارکت 🍔',
    amount: ''
  });

  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCat, setIsCustomCat] = useState(false);
  
  const currentMonth = new Date().getMonth() + 1; 
  const currentYear = new Date().getFullYear();

  const defaultCategories = [
    'خوراک و سوپرمارکت 🍔',
    'حقوق و دستمزد 💰',
    'حمل‌ونقل و تاکسی 🚗',
    'قبوض و خدمات 💡',
    'تفریح و سرگرمی 🎮',
    'پوشاک و خرید 🛍️',
    'درمان و سلامت 💊',
    'سایر 📌'
  ];

  const fetchBudgets = async () => {
    try {
      const { data } = await axios.get(
        `${BASE_URL}/budgets/status?month=${currentMonth}&year=${currentYear}`,
        { withCredentials: true } 
      );
      setBudgets(data.data);
    } catch (error) {
      console.error('خطا در دریافت بودجه‌ها:', error);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category') {
      if (value === 'سایر 📌' || value === 'custom') {
        setIsCustomCat(true);
        setBudgetForm({ ...budgetForm, category: '' });
      } else {
        setIsCustomCat(false);
        setBudgetForm({ ...budgetForm, category: value });
      }
    } else {
      setBudgetForm({ ...budgetForm, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalCategory = isCustomCat ? customCategory : budgetForm.category;
    
    try {
      await axios.post(
        `${BASE_URL}/budgets`,
        { 
          category: finalCategory || 'سایر', 
          amount: Number(budgetForm.amount), 
          month: currentMonth, 
          year: currentYear 
        },
        { withCredentials: true }
      );
      setBudgetForm({ category: 'خوراک و سوپرمارکت 🍔', amount: '' });
      setCustomCategory('');
      setIsCustomCat(false);
      fetchBudgets(); 
    } catch (error) {
      console.error('خطا در ثبت بودجه:', error);
      alert('مشکلی در ثبت بودجه پیش آمد.');
    }
  };

  const handleEditClick = (item) => {
    const isDefault = defaultCategories.includes(item.category);
    if (isDefault) {
      setIsCustomCat(false);
      setBudgetForm({ category: item.category, amount: item.limitAmount });
    } else {
      setIsCustomCat(true);
      setCustomCategory(item.category);
      setBudgetForm({ category: '', amount: item.limitAmount });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('آیا از حذف این سقف بودجه مطمئن هستید؟')) return;
    try {
      await axios.delete(`${BASE_URL}/budgets/${id}`, { withCredentials: true });
      fetchBudgets();
    } catch (error) {
      console.error('خطا در حذف بودجه:', error);
      alert('مشکلی در حذف بودجه پیش آمد.');
    }
  };

  const getProgressBarColor = (percentage) => {
    if (percentage < 70) return '#10b981'; 
    if (percentage < 90) return '#f59e0b'; 
    return '#ef4444'; 
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: colors.bgGradient, 
      padding: '2.5rem 1rem', 
      fontFamily: 'system-ui, -apple-system, sans-serif', 
      direction: 'rtl',
      color: colors.textMain,
      transition: 'background 0.3s ease, color 0.3s ease'
    }}>
      <div style={{ maxWidth: '950px', margin: '0 auto' }}>
        
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          backgroundColor: colors.cardBg,
          padding: '1.5rem 2rem',
          borderRadius: '20px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
          border: `1px solid ${colors.cardBorder}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ 
              width: '52px', 
              height: '52px', 
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', 
              borderRadius: '14px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '1.6rem',
              boxShadow: '0 8px 16px rgba(139, 92, 246, 0.2)'
            }}>
              🎯
            </div>
            <div>
              <h2 style={{ margin: '0 0 3px 0', fontSize: '1.3rem', color: colors.textMain, fontWeight: '800' }}>
                مدیریت بودجه ماهانه
              </h2>
              <p style={{ color: colors.textMuted, margin: 0, fontSize: '0.85rem' }}>
                هدف‌گذاری و کنترل سقف هزینه‌ها در این ماه
              </p>
            </div>
          </div>
          
          <Link 
            to="/" 
            style={{ 
              backgroundColor: isDarkMode ? '#334155' : '#f1f5f9', 
              color: colors.textMain, 
              textDecoration: 'none', 
              padding: '0.6rem 1.2rem', 
              borderRadius: '12px', 
              fontSize: '0.9rem', 
              fontWeight: '700',
              border: `1px solid ${colors.cardBorder}`
            }}
          >
            بازگشت به داشبورد 🏠
          </Link>
        </header>

        <main style={{ display: 'grid', gap: '2rem' }}>
          
          <div style={{ 
            padding: '2rem', 
            background: colors.cardBg, 
            borderRadius: '20px', 
            border: `1px solid ${colors.cardBorder}`,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: colors.textMain, fontSize: '1.15rem', fontWeight: '700' }}>
              ➕ تنظیم یا ویرایش سقف هزینه
            </h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '0.85rem', color: colors.textMuted, fontWeight: '600' }}>انتخاب دسته‌بندی:</label>
                <select 
                  name="category" 
                  value={isCustomCat ? 'custom' : budgetForm.category} 
                  onChange={handleChange} 
                  style={{ padding: '12px 16px', borderRadius: '12px', border: `1px solid ${colors.inputBorder}`, outline: 'none', fontSize: '0.95rem', backgroundColor: colors.inputBg, color: colors.inputText }}
                >
                  {defaultCategories.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                  <option value="custom">➕ دسته‌بندی دلخواه (سایر)...</option>
                </select>
              </div>

              {isCustomCat && (
                <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '0.85rem', color: colors.textMuted, fontWeight: '600' }}>نام دسته‌بندی دلخواه:</label>
                  <input 
                    type="text" 
                    placeholder="نام دسته‌بندی را بنویسید..." 
                    value={customCategory} 
                    onChange={(e) => setCustomCategory(e.target.value)} 
                    required 
                    style={{ padding: '12px 16px', borderRadius: '12px', border: `1px solid ${colors.inputBorder}`, outline: 'none', fontSize: '0.95rem', backgroundColor: colors.inputBg, color: colors.inputText }} 
                  />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '0.85rem', color: colors.textMuted, fontWeight: '600' }}>سقف بودجه (تومان):</label>
                <input 
                  type="number" 
                  name="amount"
                  placeholder="مثلاً: 5000000" 
                  value={budgetForm.amount} 
                  onChange={handleChange} 
                  required 
                  style={{ padding: '12px 16px', borderRadius: '12px', border: `1px solid ${colors.inputBorder}`, outline: 'none', fontSize: '0.95rem', backgroundColor: colors.inputBg, color: colors.inputText }} 
                />
              </div>

              <div style={{ gridColumn: '1 / -1', marginTop: '5px' }}>
                <button 
                  type="submit" 
                  style={{ 
                    width: '100%',
                    padding: '14px', 
                    backgroundColor: '#8b5cf6', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '12px', 
                    cursor: 'pointer', 
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)'
                  }}
                >
                  ثبت / ویرایش بودجه
                </button>
              </div>
            </form>
          </div>

          <div style={{ 
            padding: '2rem', 
            background: colors.cardBg, 
            borderRadius: '20px', 
            border: `1px solid ${colors.cardBorder}`,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.15rem', color: colors.textMain, fontWeight: '700' }}>
              📊 وضعیت بودجه‌های این ماه
            </h3>
            
            {budgets.length === 0 ? (
              <p style={{ color: colors.textMuted, textAlign: 'center', padding: '2.5rem 0', margin: 0, fontSize: '0.95rem' }}>
                هنوز بودجه‌ای برای این ماه ثبت نکرده‌اید. فرم بالا را تکمیل کنید.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {budgets.join ? budgets.map((item) => (
                  <div 
                    key={item._id} 
                    style={{ 
                      padding: '1.5rem', 
                      backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc', 
                      borderRadius: '14px',
                      border: `1px solid ${colors.cardBorder}`,
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <strong style={{ fontSize: '1.1rem', color: colors.textMain }}>{item.category}</strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontSize: '0.9rem', color: colors.textMuted, fontWeight: '600' }}>
                          <span style={{ color: item.isExceeded ? '#ef4444' : colors.textMain }}>{item.spentAmount.toLocaleString()}</span> / {item.limitAmount.toLocaleString()} تومان
                        </span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => handleEditClick(item)} style={{ backgroundColor: '#fef3c7', color: '#d97706', border: 'none', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700' }}>ویرایش</button>
                          <button onClick={() => handleDelete(item._id)} style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700' }}>حذف</button>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ 
                      width: '100%', 
                      height: '14px', 
                      backgroundColor: isDarkMode ? '#334155' : '#e2e8f0', 
                      borderRadius: '10px', 
                      overflow: 'hidden',
                      marginBottom: '8px'
                    }}>
                      <div 
                        style={{ 
                          height: '100%', 
                          width: `${Math.min(item.percentage, 100)}%`, 
                          backgroundColor: getProgressBarColor(item.percentage),
                          transition: 'width 0.8s ease-in-out',
                          borderRadius: '10px'
                        }} 
                      />
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: colors.textMuted, fontWeight: '500' }}>{item.percentage}% مصرف شده</span>
                      {item.isExceeded ? (
                        <span style={{ color: '#ef4444', fontWeight: 'bold' }}>⚠️ سقف بودجه رد شده!</span>
                      ) : (
                        <span style={{ color: '#10b981', fontWeight: '500' }}>{(item.limitAmount - item.spentAmount).toLocaleString()} تومان باقی‌مانده</span>
                      )}
                    </div>
                  </div>
                )) : null}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Budget;