import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from '../components/NotificationBell';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : 'http://localhost:5000/api';

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent === 0) return null; 

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontWeight="bold" fontSize="12">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { colors, isDarkMode, toggleTheme } = useTheme();

  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]); 
  const [dbCategories, setDbCategories] = useState([]); 
  
  const [formData, setFormData] = useState({
    title: '', amount: '', type: 'expense', category: 'خوراک و سوپرمارکت 🍔', accountId: ''
  });

  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCat, setIsCustomCat] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); 
  const [sortBy, setSortBy] = useState('newest'); 
  const [timeRange, setTimeRange] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
        setIsSubMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const defaultCategories = [
    'خوراک و سوپرمارکت 🍔', 'حقوق و دستمزد 💰', 'حمل‌ونقل و تاکسی 🚗',
    'قبوض و خدمات 💡', 'تفریح و سرگرمی 🎮', 'پوشاک و خرید 🛍️',
    'درمان و سلامت 💊', 'سایر 📌'
  ];

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/transactions`, { withCredentials: true });
      setTransactions(response.data.data);
    } catch (error) {
      console.error('خطا در دریافت اطلاعات مالی:', error);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/accounts`, { withCredentials: true });
      const accs = response.data.data || [];
      setAccounts(accs);
      if (accs.length > 0) {
        setFormData(prev => ({ ...prev, accountId: prev.accountId || accs[0]._id }));
      }
    } catch (error) {
      console.error('خطا در دریافت حساب‌ها:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/categories`, { withCredentials: true });
      if (response.data.success) {
        setDbCategories(response.data.data);
      }
    } catch (error) {
      console.error('خطا در دریافت دسته‌بندی‌های سفارشی:', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchAccounts();
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category') {
      if (value === 'سایر 📌' || value === 'custom') {
        setIsCustomCat(true);
        setFormData(prev => ({ ...prev, category: '' }));
      } else {
        setIsCustomCat(false);
        setFormData(prev => ({ ...prev, category: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.accountId) {
      alert('لطفاً یک حساب یا کارت بانکی انتخاب کنید.');
      return;
    }

    const finalCategory = isCustomCat ? customCategory : formData.category;
    const submitData = { ...formData, category: finalCategory || 'سایر' };

    try {
      if (editId) {
        const response = await axios.put(`${BASE_URL}/transactions/${editId}`, submitData, { withCredentials: true });
        setTransactions(transactions.map(tx => tx._id === editId ? response.data.data : tx));
        setEditId(null);
      } else {
        const response = await axios.post(`${BASE_URL}/transactions`, submitData, { withCredentials: true });
        setTransactions([response.data.data, ...transactions]);
      }
      setFormData({ title: '', amount: '', type: 'expense', category: 'خوراک و سوپرمارکت 🍔', accountId: accounts[0]?._id || '' });
      setCustomCategory('');
      setIsCustomCat(false);
      fetchAccounts(); 

      setTimeout(() => {
          window.dispatchEvent(new Event('refreshNotifications'));
      }, 1500);

    } catch (error) {
      console.error('خطا در ثبت/ویرایش تراکنش:', error);
      alert('مشکلی در پردازش اطلاعات پیش آمد.');
    }
  };

  const handleEditClick = (tx) => {
    setEditId(tx._id);
    const allCategoryNames = [...defaultCategories, ...dbCategories.map(c => c.name)];
    const isKnown = allCategoryNames.includes(tx.category);

    if (isKnown) {
      setIsCustomCat(false);
      setFormData({ 
        title: tx.title, 
        amount: tx.amount, 
        type: tx.type, 
        category: tx.category,
        accountId: tx.accountId?._id || tx.accountId || accounts[0]?._id || ''
      });
    } else {
      setIsCustomCat(true);
      setCustomCategory(tx.category);
      setFormData({ 
        title: tx.title, 
        amount: tx.amount, 
        type: tx.type, 
        category: '',
        accountId: tx.accountId?._id || tx.accountId || accounts[0]?._id || ''
      });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setFormData({ title: '', amount: '', type: 'expense', category: 'خوراک و سوپرمارکت 🍔', accountId: accounts[0]?._id || '' });
    setCustomCategory('');
    setIsCustomCat(false);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('آیا از حذف این تراکنش مطمئن هستید؟');
    if (!confirmDelete) return;

    try {
      await axios.delete(`${BASE_URL}/transactions/${id}`, { withCredentials: true });
      setTransactions(transactions.filter((tx) => tx._id !== id));
      fetchAccounts(); 
    } catch (error) {
      console.error('خطا در حذف تراکنش:', error);
      alert('مشکلی در حذف تراکنش پیش آمد.');
    }
  };

  const getTxRawDate = (tx) => {
    if (tx.createdAt) return new Date(tx.createdAt);
    if (tx._id) return new Date(parseInt(tx._id.substring(0, 8), 16) * 1000);
    return new Date();
  };

  const getJalaliDateString = (tx) => {
    const date = getTxRawDate(tx);
    try {
      return new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
    } catch (e) {
      return date.toLocaleDateString('fa-IR');
    }
  };

  let processedTransactions = [...transactions];
  if (filterType !== 'all') processedTransactions = processedTransactions.filter(tx => tx.type === filterType);
  if (searchTerm) processedTransactions = processedTransactions.filter(tx => tx.title.includes(searchTerm) || tx.category.includes(searchTerm));

  const now = new Date();
  if (timeRange === 'today') {
    processedTransactions = processedTransactions.filter(tx => getTxRawDate(tx).toDateString() === now.toDateString());
  } else if (timeRange === '7days') {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    processedTransactions = processedTransactions.filter(tx => getTxRawDate(tx) >= sevenDaysAgo);
  } else if (timeRange === '30days') {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    processedTransactions = processedTransactions.filter(tx => getTxRawDate(tx) >= thirtyDaysAgo);
  } else if (timeRange === 'custom') {
    if (startDate) {
      const start = new Date(startDate); start.setHours(0, 0, 0, 0);
      processedTransactions = processedTransactions.filter(tx => getTxRawDate(tx) >= start);
    }
    if (endDate) {
      const end = new Date(endDate); end.setHours(23, 59, 59, 999);
      processedTransactions = processedTransactions.filter(tx => getTxRawDate(tx) <= end);
    }
  }

  processedTransactions.sort((a, b) => {
    if (sortBy === 'amount-high') return b.amount - a.amount;
    if (sortBy === 'amount-low') return a.amount - b.amount;
    if (sortBy === 'oldest') return getTxRawDate(a) - getTxRawDate(b);
    return getTxRawDate(b) - getTxRawDate(a); 
  });

  const totalIncome = processedTransactions.filter(tx => tx.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = processedTransactions.filter(tx => tx.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  const chartData = [{ name: 'درآمدها', value: totalIncome }, { name: 'هزینه‌ها', value: totalExpense }];
  const COLORS = ['#10b981', '#f43f5e']; 

  const exportToExcel = () => {
    if (processedTransactions.length === 0) return alert('تراکنشی برای خروجی وجود ندارد.');
    let csvContent = "\uFEFFعنوان,مبلغ,نوع,دسته‌بندی,تاریخ\n";
    processedTransactions.forEach(tx => {
      csvContent += `"${tx.title}",${tx.amount},"${tx.type === 'income' ? 'درآمد' : 'هزینه'}","${tx.category}","${getJalaliDateString(tx)}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'dakhilo_report.csv';
    link.click();
  };

  const exportToPDF = () => {
    if (processedTransactions.length === 0) return alert('تراکنشی برای چاپ وجود ندارد.');
    window.print();
  };

  const getMenuItemStyle = () => ({
    padding: '12px 20px',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '0.95rem',
    fontWeight: '700',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    border: 'none',
    width: '100%',
    textAlign: 'right',
    color: colors.textMain,
    transition: 'background-color 0.15s ease'
  });

  return (
    <div style={{ 
      minHeight: '100vh', background: colors.bgGradient, padding: '1.5rem 0.75rem', 
      fontFamily: 'system-ui, -apple-system, sans-serif', direction: 'rtl',
      color: colors.textMain, transition: 'background 0.3s ease, color 0.3s ease',
      boxSizing: 'border-box'
    }}>
      <div style={{ maxWidth: '1050px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        
        {/* هدر سایت */}
        <header style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          backgroundColor: colors.cardBg, padding: '1.25rem', borderRadius: '20px',
          boxShadow: '0 12px 30px -10px rgba(0, 0, 0, 0.08)', marginBottom: '1.5rem',
          flexWrap: 'wrap', gap: '1rem', border: `1px solid ${colors.cardBorder}`,
          backdropFilter: 'blur(10px)', boxSizing: 'border-box'
        }}>
            
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', width: '100%', sm: { width: 'auto' } }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ 
                  width: '46px', height: '46px', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
                  borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontSize: '1.5rem', boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)', flexShrink: 0
                }}>🪙</div>
                <div>
                  <h2 style={{ margin: '0 0 2px 0', fontSize: '1.15rem', color: colors.textMain, fontWeight: '800', letterSpacing: '-0.5px' }}>
                    سلام، {user?.name} عزیز! 👋
                  </h2>
                  <p style={{ color: colors.textMuted, margin: 0, fontSize: '0.8rem' }}>
                    سامانه <strong style={{ color: '#3b82f6' }}>دخل‌وخرج</strong> • {user?.currency === 'IRT' ? 'تومان' : user?.currency || 'تومان'}
                  </p>
                </div>
              </div>

              {/* دکمه‌های کنترلی هدر در موبایل */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <NotificationBell />
                <button onClick={toggleTheme} title="تغییر تم" style={{ 
                  backgroundColor: isDarkMode ? '#334155' : '#f1f5f9', color: colors.textMain, border: `1px solid ${colors.cardBorder}`, 
                  padding: '0.5rem', borderRadius: '12px', cursor: 'pointer', fontSize: '0.9rem'
                }}>
                  {isDarkMode ? '☀️' : '🌙'}
                </button>
              </div>
            </div>

            {/* لینک‌های پروفایل، خروج و منوی امکانات */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: `1px solid ${colors.cardBorder}`, justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link to="/profile" style={{ 
                  backgroundColor: isDarkMode ? '#1e3a8a' : '#eff6ff', color: isDarkMode ? '#93c5fd' : '#1d4ed8', 
                  textDecoration: 'none', padding: '0.5rem 0.9rem', borderRadius: '12px', fontSize: '0.82rem', 
                  fontWeight: '700', border: `1px solid ${colors.cardBorder}`
                }}>⚙️ پروفایل</Link>

                <button onClick={logout} style={{ 
                  backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', 
                  padding: '0.5rem 0.9rem', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '0.82rem'
                }}>خروج</button>
              </div>

              <div style={{ position: 'relative' }} ref={menuRef}>
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '6px',
                    backgroundColor: '#059669', color: 'white', border: 'none', 
                    padding: '0.5rem 1rem', borderRadius: '12px', cursor: 'pointer', 
                    fontWeight: '700', fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)'
                  }}
                >
                  ☰ منوی امکانات
                </button>

                {isMenuOpen && (
                  <div style={{
                    position: 'absolute', left: 0, top: '120%',
                    backgroundColor: colors.cardBg, border: `1px solid ${colors.cardBorder}`,
                    borderRadius: '16px', boxShadow: '0 15px 35px rgba(0, 0, 0, 0.15)',
                    display: 'flex', flexDirection: 'column', minWidth: '220px', zIndex: 100, overflow: 'hidden'
                  }}>
                    <Link to="/budget" style={{ ...getMenuItemStyle(), borderBottom: `1px solid ${colors.cardBorder}`, color: '#8b5cf6' }}>🎯 بودجه ماهانه</Link>
                    <Link to="/accounts" style={{ ...getMenuItemStyle(), borderBottom: `1px solid ${colors.cardBorder}`, color: '#2563eb' }}>💳 مدیریت حساب‌ها</Link>
                    <Link to="/categories" style={{ ...getMenuItemStyle(), borderBottom: `1px solid ${colors.cardBorder}`, color: '#f59e0b' }}>📁 دسته‌بندی‌های سفارشی</Link>
                    <Link to="/analytics" style={{ ...getMenuItemStyle(), borderBottom: `1px solid ${colors.cardBorder}`, color: '#3b82f6' }}>📊 تحلیل نموداری</Link>
                    
                    <div style={{ position: 'relative' }}>
                      <button onClick={() => setIsSubMenuOpen(!isSubMenuOpen)} style={getMenuItemStyle()}>
                        <span>📥 گرفتن خروجی</span> <span>{isSubMenuOpen ? '▼' : '◀'}</span>
                      </button>

                      {isSubMenuOpen && (
                        <div style={{ backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc', display: 'flex', flexDirection: 'column', borderTop: `1px solid ${colors.cardBorder}` }}>
                          <button onClick={() => { exportToExcel(); setIsMenuOpen(false); setIsSubMenuOpen(false); }} style={{ ...getMenuItemStyle(), borderBottom: `1px solid ${colors.cardBorder}`, fontSize: '0.82rem' }}>📊 خروجی اکسل (CSV)</button>
                          <button onClick={() => { exportToPDF(); setIsMenuOpen(false); setIsSubMenuOpen(false); }} style={{ ...getMenuItemStyle(), fontSize: '0.82rem' }}>📄 چاپ / PDF گزارش</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* کارت‌های آماری بالا */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100%, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '1.25rem', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', borderRadius: '20px', color: 'white', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.88rem', opacity: 0.9, fontWeight: '600' }}>موجودی در این بازه</span>
              <span style={{ fontSize: '1.2rem', background: 'rgba(255,255,255,0.2)', padding: '6px', borderRadius: '10px' }}>💳</span>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', direction: 'ltr', textAlign: 'right' }}>
              {balance.toLocaleString()} <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>{user?.currency || 'IRT'}</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ padding: '1.25rem', background: colors.cardBg, borderRadius: '20px', border: `1px solid ${colors.cardBorder}`, boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: colors.textMuted, fontWeight: '700' }}>درآمد</span>
                <span style={{ fontSize: '1rem', background: '#ecfdf5', padding: '4px', borderRadius: '8px' }}>🟢</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#10b981', direction: 'ltr', textAlign: 'right', wordBreak: 'break-all' }}>
                + {totalIncome.toLocaleString()}
              </div>
            </div>

            <div style={{ padding: '1.25rem', background: colors.cardBg, borderRadius: '20px', border: `1px solid ${colors.cardBorder}`, boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: colors.textMuted, fontWeight: '700' }}>هزینه</span>
                <span style={{ fontSize: '1rem', background: '#fff1f2', padding: '4px', borderRadius: '8px' }}>🔴</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f43f5e', direction: 'ltr', textAlign: 'right', wordBreak: 'break-all' }}>
                - {totalExpense.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* نمودار دایره‌ای */}
        {processedTransactions.length > 0 && (totalIncome > 0 || totalExpense > 0) && (
          <div style={{ background: colors.cardBg, borderRadius: '20px', border: `1px solid ${colors.cardBorder}`, padding: '1.25rem', marginBottom: '1.5rem', textAlign: 'center', boxSizing: 'border-box' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem', color: colors.textMain, fontWeight: '800' }}>📊 تحلیل نسبت درآمد و هزینه</h3>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer><PieChart><Pie data={chartData} cx="50%" cy="50%" labelLine={false} label={renderCustomizedLabel} innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="value">{chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />))}</Pie><Tooltip formatter={(value) => `${value.toLocaleString()} ${user?.currency || 'IRT'}`} /><Legend verticalAlign="bottom" height={36}/></PieChart></ResponsiveContainer>
            </div>
          </div>
        )}

        <main style={{ display: 'grid', gap: '1.5rem' }}>
          
          {/* فرم افزودن/ویرایش */}
          <div style={{ padding: '1.25rem', background: editId ? (isDarkMode ? '#3f3f46' : '#fffbeb') : colors.cardBg, borderRadius: '20px', border: `1px solid ${editId ? '#fcd34d' : colors.cardBorder}`, boxSizing: 'border-box' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.25rem', color: editId ? '#f59e0b' : colors.textMain, fontSize: '1.1rem', fontWeight: '800' }}>
              {editId ? '✏️ ویرایش تراکنش' : '➕ افزودن تراکنش جدید'}
            </h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
              <input type="text" name="title" placeholder="عنوان (مثلاً: حقوق، رستوران)" value={formData.title} onChange={handleChange} required style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: `1px solid ${colors.inputBorder}`, outline: 'none', fontSize: '0.95rem', backgroundColor: colors.inputBg, color: colors.inputText, boxSizing: 'border-box' }} />
              
              <input type="number" name="amount" placeholder="مبلغ" value={formData.amount} onChange={handleChange} required style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: `1px solid ${colors.inputBorder}`, outline: 'none', fontSize: '0.95rem', backgroundColor: colors.inputBg, color: colors.inputText, boxSizing: 'border-box' }} />
              
              <select name="type" value={formData.type} onChange={handleChange} style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: `1px solid ${colors.inputBorder}`, outline: 'none', fontSize: '0.95rem', backgroundColor: colors.inputBg, color: colors.inputText, boxSizing: 'border-box' }}>
                <option value="expense">هزینه 🔴</option>
                <option value="income">درآمد 🟢</option>
              </select>

              <select name="category" value={isCustomCat ? 'custom' : formData.category} onChange={handleChange} style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: `1px solid ${colors.inputBorder}`, outline: 'none', fontSize: '0.95rem', backgroundColor: colors.inputBg, color: colors.inputText, boxSizing: 'border-box' }}>
                <optgroup label="دسته‌های پیش‌فرض">
                  {defaultCategories.map((cat, idx) => (<option key={idx} value={cat}>{cat}</option>))}
                </optgroup>
                {dbCategories.length > 0 && (
                  <optgroup label="دسته‌های سفارشی شما 📁">
                    {dbCategories.map((cat) => (
                      <option key={cat._id} value={cat.name}>{cat.name} ({cat.type === 'income' ? 'درآمد' : 'هزینه'})</option>
                    ))}
                  </optgroup>
                )}
                <option value="custom">➕ سایر (متن دلخواه)...</option>
              </select>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px', color: colors.textMuted }}>انتخاب حساب / کارت بانکی</label>
                <select 
                  name="accountId" 
                  value={formData.accountId} 
                  onChange={handleChange} 
                  required
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: `1px solid ${colors.inputBorder}`, outline: 'none', fontSize: '0.95rem', backgroundColor: colors.inputBg, color: colors.inputText, boxSizing: 'border-box' }}
                >
                  <option value="">-- لطفاً حساب مربوطه را انتخاب کنید --</option>
                  {accounts.map((acc) => (
                    <option key={acc._id} value={acc._id}>
                      {acc.name} {acc.cardNumber ? `(****-${acc.cardNumber})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {isCustomCat && (
                <input type="text" placeholder="نام دسته‌بندی دلخواه..." value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} required style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: `1px solid ${colors.inputBorder}`, outline: 'none', fontSize: '0.95rem', backgroundColor: colors.inputBg, color: colors.inputText, boxSizing: 'border-box' }} />
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button type="submit" style={{ flex: 1, padding: '12px', backgroundColor: editId ? '#d97706' : '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
                  {editId ? 'ذخیره تغییرات' : 'ثبت تراکنش'}
                </button>
                {editId && (
                  <button type="button" onClick={handleCancelEdit} style={{ padding: '12px 20px', backgroundColor: '#64748b', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>لغو</button>
                )}
              </div>
            </form>
          </div>

          {/* تاریخچه تراکنش‌ها و فیلترها */}
          <div style={{ padding: '1.25rem', background: colors.cardBg, borderRadius: '20px', border: `1px solid ${colors.cardBorder}`, boxSizing: 'border-box' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.25rem', fontSize: '1.1rem', color: colors.textMain, fontWeight: '800' }}>📋 تاریخچه تراکنش‌ها</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginBottom: '1rem' }}>
              <input type="text" placeholder="🔍 جستجو در عنوان یا دسته‌بندی..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: '12px', border: `1px solid ${colors.inputBorder}`, outline: 'none', backgroundColor: colors.inputBg, color: colors.inputText, fontSize: '0.9rem', boxSizing: 'border-box' }} />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ width: '100%', padding: '11px 12px', borderRadius: '12px', border: `1px solid ${colors.inputBorder}`, outline: 'none', backgroundColor: colors.inputBg, color: colors.inputText, fontSize: '0.85rem', boxSizing: 'border-box' }}>
                  <option value="all">همه تراکنش‌ها</option>
                  <option value="income">فقط درآمدها</option>
                  <option value="expense">فقط هزینه‌ها</option>
                </select>

                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ width: '100%', padding: '11px 12px', borderRadius: '12px', border: `1px solid ${colors.inputBorder}`, outline: 'none', backgroundColor: colors.inputBg, color: colors.inputText, fontSize: '0.85rem', boxSizing: 'border-box' }}>
                  <option value="newest">جدیدترین</option>
                  <option value="oldest">قدیمی‌ترین</option>
                  <option value="amount-high">بیشترین مبلغ</option>
                  <option value="amount-low">کمترین مبلغ</option>
                </select>
              </div>
            </div>

            {/* فیلتر زمانی */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.25rem', padding: '12px', backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc', borderRadius: '14px', border: `1px solid ${colors.cardBorder}`, boxSizing: 'border-box' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: colors.textMuted }}>📅 فیلتر بازه زمانی:</span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[{ id: 'all', label: 'همه' }, { id: 'today', label: 'امروز' }, { id: '7days', label: '۷ روز' }, { id: '30days', label: '۳۰ روز' }, { id: 'custom', label: 'دلخواه ⚙️' }].map((item) => (
                  <button key={item.id} onClick={() => setTimeRange(item.id)} style={{ padding: '7px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700', backgroundColor: timeRange === item.id ? '#3b82f6' : (isDarkMode ? '#334155' : '#e2e8f0'), color: timeRange === item.id ? '#ffffff' : colors.textMain }}>{item.label}</button>
                ))}
              </div>
              {timeRange === 'custom' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '6px', paddingTop: '8px', borderTop: `1px dashed ${colors.cardBorder}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: colors.textMuted, width: '25px' }}>از:</span>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ flex: 1, padding: '7px 10px', borderRadius: '8px', border: `1px solid ${colors.inputBorder}`, backgroundColor: colors.inputBg, color: colors.inputText, fontSize: '0.85rem', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: colors.textMuted, width: '25px' }}>تا:</span>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ flex: 1, padding: '7px 10px', borderRadius: '8px', border: `1px solid ${colors.inputBorder}`, backgroundColor: colors.inputBg, color: colors.inputText, fontSize: '0.85rem', outline: 'none' }} />
                  </div>
                </div>
              )}
            </div>

            {/* لیست تراکنش‌ها */}
            {processedTransactions.length === 0 ? (
              <p style={{ color: colors.textMuted, textAlign: 'center', padding: '2rem 0', margin: 0, fontSize: '0.9rem' }}>تراکنشی یافت نشد.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {processedTransactions.map((tx) => (
                  <div key={tx._id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '1rem', backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc', borderRadius: '14px', border: `1px solid ${colors.cardBorder}`, boxSizing: 'border-box' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                      <strong style={{ fontSize: '0.98rem', color: colors.textMain, fontWeight: '700', wordBreak: 'break-word' }}>{tx.title}</strong>
                      <div style={{ color: tx.type === 'income' ? '#10b981' : '#f43f5e', fontWeight: '800', fontSize: '1.05rem', direction: 'ltr', whiteSpace: 'nowrap' }}>
                        {tx.type === 'income' ? '+' : '-'} {tx.amount.toLocaleString()} {user?.currency || 'IRT'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', color: colors.textMuted, backgroundColor: isDarkMode ? '#334155' : '#e2e8f0', padding: '2px 8px', borderRadius: '6px', fontWeight: '600' }}>{tx.category}</span>
                      <span style={{ fontSize: '0.75rem', color: colors.textMuted }}>🕒 {getJalaliDateString(tx)}</span>
                      {tx.accountId && (
                        <span style={{ fontSize: '0.75rem', color: '#3b82f6', backgroundColor: isDarkMode ? '#1e3a8a' : '#eff6ff', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>
                          💳 {tx.accountId.name || 'حساب'}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px', paddingTop: '6px', borderTop: `1px solid ${colors.cardBorder}` }}>
                      <button onClick={() => handleEditClick(tx)} style={{ backgroundColor: '#fef3c7', color: '#d97706', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '700' }}>ویرایش</button>
                      <button onClick={() => handleDelete(tx._id)} style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '700' }}>حذف</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;