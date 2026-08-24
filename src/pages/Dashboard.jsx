import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from '../components/NotificationBell';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
      const response = await axios.get('http://localhost:5000/api/transactions', { withCredentials: true });
      setTransactions(response.data.data);
    } catch (error) {
      console.error('خطا در دریافت اطلاعات مالی:', error);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/accounts', { withCredentials: true });
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
      const response = await axios.get('http://localhost:5000/api/categories', { withCredentials: true });
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
        const response = await axios.put(`http://localhost:5000/api/transactions/${editId}`, submitData, { withCredentials: true });
        setTransactions(transactions.map(tx => tx._id === editId ? response.data.data : tx));
        setEditId(null);
      } else {
        const response = await axios.post('http://localhost:5000/api/transactions', submitData, { withCredentials: true });
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
      await axios.delete(`http://localhost:5000/api/transactions/${id}`, { withCredentials: true });
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
      minHeight: '100vh', background: colors.bgGradient, padding: '3rem 1.5rem', 
      fontFamily: 'system-ui, -apple-system, sans-serif', direction: 'rtl',
      color: colors.textMain, transition: 'background 0.3s ease, color 0.3s ease'
    }}>
      <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
        
        {/* هدر سایت با افکت مدرن */}
        <header style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          backgroundColor: colors.cardBg, padding: '1.75rem 2.25rem', borderRadius: '24px',
          boxShadow: '0 12px 30px -10px rgba(0, 0, 0, 0.08)', marginBottom: '2.5rem',
          flexWrap: 'wrap', gap: '1.5rem', border: `1px solid ${colors.cardBorder}`,
          backdropFilter: 'blur(10px)'
        }}>
            
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ 
                width: '56px', height: '56px', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
                borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontSize: '1.8rem', boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)'
              }}>🪙</div>
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '1.4rem', color: colors.textMain, fontWeight: '800', letterSpacing: '-0.5px' }}>
                  سلام، {user?.name} عزیز! 👋
                </h2>
                <p style={{ color: colors.textMuted, margin: 0, fontSize: '0.88rem' }}>
                  سامانه <strong style={{ color: '#3b82f6' }}>دخل‌وخرج</strong> • واحد پول: {user?.currency === 'IRT' ? 'تومان' : user?.currency || 'تومان'}
                </p>
              </div>
            </div>

            <div style={{ width: '1px', height: '40px', backgroundColor: colors.cardBorder, margin: '0 5px' }}></div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <NotificationBell />

              <button onClick={toggleTheme} title="تغییر تم" style={{ 
                backgroundColor: isDarkMode ? '#334155' : '#f1f5f9', color: colors.textMain, border: `1px solid ${colors.cardBorder}`, 
                padding: '0.65rem 1rem', borderRadius: '14px', cursor: 'pointer', fontWeight: '700', fontSize: '1rem',
                transition: 'transform 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
              }}>
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              
              <Link to="/profile" style={{ 
                backgroundColor: isDarkMode ? '#1e3a8a' : '#eff6ff', color: isDarkMode ? '#93c5fd' : '#1d4ed8', 
                textDecoration: 'none', padding: '0.65rem 1.25rem', borderRadius: '14px', fontSize: '0.9rem', 
                fontWeight: '700', border: `1px solid ${colors.cardBorder}`, transition: 'all 0.2s'
              }}>⚙️ پروفایل</Link>

              <button onClick={logout} style={{ 
                backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', 
                padding: '0.65rem 1.25rem', borderRadius: '14px', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem',
                transition: 'all 0.2s'
              }}>خروج</button>
            </div>
          </div>
          
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '8px',
                backgroundColor: '#059669', color: 'white', border: 'none', 
                padding: '0.75rem 1.4rem', borderRadius: '14px', cursor: 'pointer', 
                fontWeight: '700', fontSize: '1rem', boxShadow: '0 6px 15px rgba(5, 150, 105, 0.25)',
                transition: 'all 0.2s'
              }}
            >
              ☰ منوی امکانات
            </button>

            {isMenuOpen && (
              <div style={{
                position: 'absolute', left: 0, top: '125%',
                backgroundColor: colors.cardBg, border: `1px solid ${colors.cardBorder}`,
                borderRadius: '18px', boxShadow: '0 15px 35px rgba(0, 0, 0, 0.15)',
                display: 'flex', flexDirection: 'column', minWidth: '240px', zIndex: 100, overflow: 'hidden'
              }}>
                <Link 
                  to="/budget" 
                  style={{ ...getMenuItemStyle(), borderBottom: `1px solid ${colors.cardBorder}`, color: '#8b5cf6' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDarkMode ? '#334155' : '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  🎯 بودجه ماهانه
                </Link>

                <Link 
                  to="/accounts" 
                  style={{ ...getMenuItemStyle(), borderBottom: `1px solid ${colors.cardBorder}`, color: '#2563eb' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDarkMode ? '#334155' : '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  💳 مدیریت حساب‌ها
                </Link>

                <Link 
                  to="/categories" 
                  style={{ ...getMenuItemStyle(), borderBottom: `1px solid ${colors.cardBorder}`, color: '#f59e0b' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDarkMode ? '#334155' : '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  📁 دسته‌بندی‌های سفارشی
                </Link>

                <Link 
                  to="/analytics" 
                  style={{ ...getMenuItemStyle(), borderBottom: `1px solid ${colors.cardBorder}`, color: '#3b82f6' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDarkMode ? '#334155' : '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  📊 تحلیل نموداری
                </Link>
                
                <div style={{ position: 'relative' }}>
                  <button 
                    onClick={() => setIsSubMenuOpen(!isSubMenuOpen)} 
                    style={getMenuItemStyle()}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDarkMode ? '#334155' : '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <span>📥 گرفتن خروجی</span> <span>{isSubMenuOpen ? '▼' : '◀'}</span>
                  </button>

                  {isSubMenuOpen && (
                    <div style={{
                      backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc',
                      display: 'flex', flexDirection: 'column', borderTop: `1px solid ${colors.cardBorder}`
                    }}>
                      <button 
                        onClick={() => { exportToExcel(); setIsMenuOpen(false); setIsSubMenuOpen(false); }} 
                        style={{ ...getMenuItemStyle(), borderBottom: `1px solid ${colors.cardBorder}`, fontSize: '0.88rem' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDarkMode ? '#334155' : '#f1f5f9'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        📊 خروجی اکسل (CSV)
                      </button>
                      <button 
                        onClick={() => { exportToPDF(); setIsMenuOpen(false); setIsSubMenuOpen(false); }} 
                        style={{ ...getMenuItemStyle(), fontSize: '0.88rem' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDarkMode ? '#334155' : '#f1f5f9'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        📄 چاپ / PDF گزارش
                      </button>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </header>

        {/* کارت‌های آماری مدرن با گرادیان‌های جذاب */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem', marginBottom: '2.5rem' }}>
          <div style={{ padding: '2rem', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', borderRadius: '24px', color: 'white', boxShadow: '0 12px 25px rgba(59, 130, 246, 0.3)', transition: 'transform 0.2s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.95rem', opacity: 0.9, fontWeight: '600' }}>موجودی در این بازه</span>
              <span style={{ fontSize: '1.4rem', background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '12px' }}>💳</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800', direction: 'ltr', textAlign: 'right', letterSpacing: '-0.5px' }}>
              {balance.toLocaleString()} <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>{user?.currency || 'IRT'}</span>
            </div>
          </div>

          <div style={{ padding: '2rem', background: colors.cardBg, borderRadius: '24px', border: `1px solid ${colors.cardBorder}`, boxShadow: '0 8px 20px -5px rgba(0, 0, 0, 0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.95rem', color: colors.textMuted, fontWeight: '700' }}>مجموع درآمدها</span>
              <span style={{ fontSize: '1.4rem', background: '#ecfdf5', padding: '8px', borderRadius: '12px' }}>🟢</span>
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#10b981', direction: 'ltr', textAlign: 'right', letterSpacing: '-0.5px' }}>
              + {totalIncome.toLocaleString()}
            </div>
          </div>

          <div style={{ padding: '2rem', background: colors.cardBg, borderRadius: '24px', border: `1px solid ${colors.cardBorder}`, boxShadow: '0 8px 20px -5px rgba(0, 0, 0, 0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.95rem', color: colors.textMuted, fontWeight: '700' }}>مجموع هزینه‌ها</span>
              <span style={{ fontSize: '1.4rem', background: '#fff1f2', padding: '8px', borderRadius: '12px' }}>🔴</span>
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#f43f5e', direction: 'ltr', textAlign: 'right', letterSpacing: '-0.5px' }}>
              - {totalExpense.toLocaleString()}
            </div>
          </div>
        </div>

        {/* بخش نمودار تحلیل */}
        {processedTransactions.length > 0 && (totalIncome > 0 || totalExpense > 0) && (
          <div style={{ background: colors.cardBg, borderRadius: '24px', border: `1px solid ${colors.cardBorder}`, padding: '2.25rem', marginBottom: '2.5rem', textAlign: 'center', boxShadow: '0 8px 20px -5px rgba(0, 0, 0, 0.04)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.75rem', fontSize: '1.25rem', color: colors.textMain, fontWeight: '800' }}>📊 تحلیل نسبت درآمد و هزینه</h3>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer><PieChart><Pie data={chartData} cx="50%" cy="50%" labelLine={false} label={renderCustomizedLabel} innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="value">{chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />))}</Pie><Tooltip formatter={(value) => `${value.toLocaleString()} ${user?.currency || 'IRT'}`} /><Legend verticalAlign="bottom" height={36}/></PieChart></ResponsiveContainer>
            </div>
          </div>
        )}

        <main style={{ display: 'grid', gap: '2.5rem' }}>
          
          {/* فرم ثبت یا ویرایش تراکنش */}
          <div style={{ padding: '2.25rem', background: editId ? (isDarkMode ? '#3f3f46' : '#fffbeb') : colors.cardBg, borderRadius: '24px', border: `1px solid ${editId ? '#fcd34d' : colors.cardBorder}`, boxShadow: '0 8px 20px -5px rgba(0, 0, 0, 0.04)', transition: 'all 0.3s' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.75rem', color: editId ? '#f59e0b' : colors.textMain, fontSize: '1.25rem', fontWeight: '800' }}>
              {editId ? '✏️ ویرایش تراکنش انتخابی' : '➕ افزودن تراکنش جدید'}
            </h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
              <input type="text" name="title" placeholder="عنوان (مثلاً: حقوق، رستوران)" value={formData.title} onChange={handleChange} required style={{ padding: '14px 18px', borderRadius: '14px', border: `1px solid ${colors.inputBorder}`, outline: 'none', fontSize: '0.98rem', backgroundColor: colors.inputBg, color: colors.inputText, transition: 'border-color 0.2s' }} />
              
              <input type="number" name="amount" placeholder="مبلغ" value={formData.amount} onChange={handleChange} required style={{ padding: '14px 18px', borderRadius: '14px', border: `1px solid ${colors.inputBorder}`, outline: 'none', fontSize: '0.98rem', backgroundColor: colors.inputBg, color: colors.inputText, transition: 'border-color 0.2s' }} />
              
              <select name="type" value={formData.type} onChange={handleChange} style={{ padding: '14px 18px', borderRadius: '14px', border: `1px solid ${colors.inputBorder}`, outline: 'none', fontSize: '0.98rem', backgroundColor: colors.inputBg, color: colors.inputText }}>
                <option value="expense">هزینه 🔴</option>
                <option value="income">درآمد 🟢</option>
              </select>

              <select name="category" value={isCustomCat ? 'custom' : formData.category} onChange={handleChange} style={{ padding: '14px 18px', borderRadius: '14px', border: `1px solid ${colors.inputBorder}`, outline: 'none', fontSize: '0.98rem', backgroundColor: colors.inputBg, color: colors.inputText }}>
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

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', marginBottom: '10px', color: colors.textMuted }}>انتخاب حساب / کارت بانکی</label>
                <select 
                  name="accountId" 
                  value={formData.accountId} 
                  onChange={handleChange} 
                  required
                  style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: `1px solid ${colors.inputBorder}`, outline: 'none', fontSize: '0.98rem', backgroundColor: colors.inputBg, color: colors.inputText, boxSizing: 'border-box' }}
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
                <input type="text" placeholder="نام دسته‌بندی دلخواه را بنویسید..." value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} required style={{ gridColumn: '1 / -1', padding: '14px 18px', borderRadius: '14px', border: `1px solid ${colors.inputBorder}`, outline: 'none', fontSize: '0.98rem', backgroundColor: colors.inputBg, color: colors.inputText }} />
              )}

              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '14px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, padding: '15px', backgroundColor: editId ? '#d97706' : '#3b82f6', color: 'white', border: 'none', borderRadius: '14px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.05rem', boxShadow: '0 6px 16px rgba(59, 130, 246, 0.25)', transition: 'background-color 0.2s' }}>
                  {editId ? 'ذخیره تغییرات' : 'ثبت تراکنش'}
                </button>
                {editId && (
                  <button type="button" onClick={handleCancelEdit} style={{ padding: '15px 32px', backgroundColor: '#64748b', color: 'white', border: 'none', borderRadius: '14px', cursor: 'pointer', fontWeight: 'bold' }}>لغو</button>
                )}
              </div>
            </form>
          </div>

          {/* بخش تاریخچه تراکنش‌ها و ابزارهای فیلتر */}
          <div style={{ padding: '2.25rem', background: colors.cardBg, borderRadius: '24px', border: `1px solid ${colors.cardBorder}`, boxShadow: '0 8px 20px -5px rgba(0, 0, 0, 0.04)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.75rem', fontSize: '1.25rem', color: colors.textMain, fontWeight: '800' }}>📋 تاریخچه تراکنش‌ها</h3>
            
            <div style={{ display: 'flex', gap: '14px', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <input type="text" placeholder="🔍 جستجو در عنوان یا دسته‌بندی..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 2, minWidth: '200px', padding: '13px 18px', borderRadius: '14px', border: `1px solid ${colors.inputBorder}`, outline: 'none', backgroundColor: colors.inputBg, color: colors.inputText, fontSize: '0.95rem' }} />
              
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ flex: 1, minWidth: '140px', padding: '13px 18px', borderRadius: '14px', border: `1px solid ${colors.inputBorder}`, outline: 'none', backgroundColor: colors.inputBg, color: colors.inputText, fontSize: '0.95rem' }}>
                <option value="all">همه تراکنش‌ها</option>
                <option value="income">فقط درآمدها</option>
                <option value="expense">فقط هزینه‌ها</option>
              </select>

              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ flex: 1, minWidth: '140px', padding: '13px 18px', borderRadius: '14px', border: `1px solid ${colors.inputBorder}`, outline: 'none', backgroundColor: colors.inputBg, color: colors.inputText, fontSize: '0.95rem' }}>
                <option value="newest">جدیدترین</option>
                <option value="oldest">قدیمی‌ترین</option>
                <option value="amount-high">بیشترین مبلغ</option>
                <option value="amount-low">کمترین مبلغ</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '1.75rem', alignItems: 'center', flexWrap: 'wrap', padding: '16px', backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc', borderRadius: '16px', border: `1px solid ${colors.cardBorder}` }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: colors.textMuted }}>📅 فیلتر بازه زمانی:</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[{ id: 'all', label: 'همه' }, { id: 'today', label: 'امروز' }, { id: '7days', label: '۷ روز اخیر' }, { id: '30days', label: '۳۰ روز اخیر' }, { id: 'custom', label: 'بازه دلخواه ⚙️' }].map((item) => (
                  <button key={item.id} onClick={() => setTimeRange(item.id)} style={{ padding: '9px 16px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '0.88rem', fontWeight: '700', backgroundColor: timeRange === item.id ? '#3b82f6' : (isDarkMode ? '#334155' : '#e2e8f0'), color: timeRange === item.id ? '#ffffff' : colors.textMain, transition: 'all 0.2s' }}>{item.label}</button>
                ))}
              </div>
              {timeRange === 'custom' && (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%', marginTop: '10px', paddingTop: '10px', borderTop: `1px dashed ${colors.cardBorder}` }}>
                  <span style={{ fontSize: '0.85rem', color: colors.textMuted }}>از:</span>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: '8px 12px', borderRadius: '10px', border: `1px solid ${colors.inputBorder}`, backgroundColor: colors.inputBg, color: colors.inputText, fontSize: '0.9rem', outline: 'none' }} />
                  <span style={{ fontSize: '0.85rem', color: colors.textMuted }}>تا:</span>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: '8px 12px', borderRadius: '10px', border: `1px solid ${colors.inputBorder}`, backgroundColor: colors.inputBg, color: colors.inputText, fontSize: '0.9rem', outline: 'none' }} />
                </div>
              )}
            </div>

            {processedTransactions.length === 0 ? (
              <p style={{ color: colors.textMuted, textAlign: 'center', padding: '3rem 0', margin: 0, fontSize: '1rem' }}>تراکنشی یافت نشد.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {processedTransactions.map((tx) => (
                  <div key={tx._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.6rem', backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc', borderRadius: '16px', border: `1px solid ${colors.cardBorder}`, transition: 'transform 0.15s ease' }}>
                    <div>
                      <strong style={{ fontSize: '1.05rem', color: colors.textMain, fontWeight: '700' }}>{tx.title}</strong>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.8rem', color: colors.textMuted, backgroundColor: isDarkMode ? '#334155' : '#e2e8f0', padding: '3px 10px', borderRadius: '8px', fontWeight: '600' }}>{tx.category}</span>
                        <span style={{ fontSize: '0.8rem', color: colors.textMuted }}>🕒 {getJalaliDateString(tx)}</span>
                        {tx.accountId && (
                          <span style={{ fontSize: '0.8rem', color: '#3b82f6', backgroundColor: isDarkMode ? '#1e3a8a' : '#eff6ff', padding: '3px 10px', borderRadius: '8px', fontWeight: '700' }}>
                            💳 {tx.accountId.name || 'حساب'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{ color: tx.type === 'income' ? '#10b981' : '#f43f5e', fontWeight: '800', fontSize: '1.15rem', direction: 'ltr', letterSpacing: '-0.5px' }}>
                        {tx.type === 'income' ? '+' : '-'} {tx.amount.toLocaleString()} {user?.currency || 'IRT'}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleEditClick(tx)} style={{ backgroundColor: '#fef3c7', color: '#d97706', border: 'none', padding: '8px 14px', borderRadius: '12px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: '700', transition: 'opacity 0.2s' }}>ویرایش</button>
                        <button onClick={() => handleDelete(tx._id)} style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '8px 14px', borderRadius: '12px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: '700', transition: 'opacity 0.2s' }}>حذف</button>
                      </div>
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