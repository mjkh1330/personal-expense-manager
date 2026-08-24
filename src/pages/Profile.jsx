import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserProfile, updateUserProfile } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const Profile = () => {
  const { colors, isDarkMode, toggleTheme } = useTheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currency, setCurrency] = useState('IRT');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // دریافت اطلاعات کاربر در زمان لود شدن صفحه
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userData = await getUserProfile();
        setName(userData.name);
        setEmail(userData.email);
        setCurrency(userData.currency || 'IRT');
      } catch (err) {
        setError('خطا در دریافت اطلاعات کاربری.');
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const updateData = { name, currency };
      if (password) {
        updateData.password = password;
      }

      const updatedUser = await updateUserProfile(updateData);
      setSuccess(updatedUser.message || 'پروفایل با موفقیت به‌روزرسانی شد.');
      setPassword(''); // خالی کردن فیلد رمز عبور بعد از آپدیت موفق
    } catch (err) {
      setError(err.message || 'خطایی در به‌روزرسانی رخ داد.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: colors.bgGradient, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif' 
      }}>
        <div style={{ background: colors.cardBg, padding: '2rem', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: `1px solid ${colors.cardBorder}` }}>
          <p style={{ margin: 0, color: colors.textMuted, fontWeight: '600' }}>در حال بارگذاری اطلاعات...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: colors.bgGradient, 
      padding: '3rem 1.5rem', 
      fontFamily: 'system-ui, -apple-system, sans-serif', 
      direction: 'rtl',
      color: colors.textMain,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative'
    }}>
      
      {/* دکمه تغییر تم شناور در بالا */}
      <div style={{ position: 'absolute', top: '25px', left: '25px' }}>
        <button 
          onClick={toggleTheme} 
          title="تغییر تم (تاریک/روشن)"
          style={{ 
            backgroundColor: isDarkMode ? '#334155' : '#ffffff', 
            color: colors.textMain, 
            border: `1px solid ${colors.cardBorder}`, 
            padding: '0.6rem 0.9rem', 
            borderRadius: '12px', 
            cursor: 'pointer', 
            fontWeight: '700',
            fontSize: '1rem',
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
            transition: 'all 0.2s'
          }}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>

      <div style={{ 
        width: '100%', 
        maxWidth: '480px', 
        background: colors.cardBg, 
        borderRadius: '24px', 
        padding: '2.5rem', 
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: `1px solid ${colors.cardBorder}`
      }}>
        
        {/* هدر صفحه پروفایل با لوگو */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '1.8rem',
            margin: '0 auto 1rem auto',
            boxShadow: '0 10px 20px rgba(37, 99, 235, 0.3)'
          }}>
            ⚙️
          </div>
          <h1 style={{ margin: '0 0 5px 0', fontSize: '1.5rem', color: colors.textMain, fontWeight: '800' }}>پروفایل کاربری</h1>
          <p style={{ color: colors.textMuted, margin: 0, fontSize: '0.9rem' }}>مدیریت اطلاعات حساب و تنظیمات شخصی</p>
        </div>

        {/* پیام‌های خطا یا موفقیت */}
        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '1.5rem', border: '1px solid #fecaca', textAlign: 'center', fontWeight: '500' }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ backgroundColor: '#f0fdf4', color: '#059669', padding: '12px 16px', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '1.5rem', border: '1px solid #bbf7d0', textAlign: 'center', fontWeight: '500' }}>
            {success}
          </div>
        )}

        {/* فرم پروفایل */}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600', color: colors.textMain }}>نام و نام خانوادگی</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: '100%', boxSizing: 'border-box', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${colors.inputBorder}`, outline: 'none', fontSize: '0.95rem', backgroundColor: colors.inputBg, color: colors.inputText, transition: 'all 0.2s' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600', color: colors.textMain }}>ایمیل (غیرقابل تغییر)</label>
            <input
              type="email"
              value={email}
              disabled
              style={{ width: '100%', boxSizing: 'border-box', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${colors.inputBorder}`, outline: 'none', fontSize: '0.95rem', backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9', color: colors.textMuted, cursor: 'not-allowed' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600', color: colors.textMain }}>رمز عبور جدید (اختیاری)</label>
            <input
              type="password"
              placeholder="برای تغییر، رمز جدید را وارد کنید"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              style={{ width: '100%', boxSizing: 'border-box', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${colors.inputBorder}`, outline: 'none', fontSize: '0.95rem', backgroundColor: colors.inputBg, color: colors.inputText, transition: 'all 0.2s' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600', color: colors.textMain }}>واحد پولی پیش‌فرض</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${colors.inputBorder}`, outline: 'none', fontSize: '0.95rem', backgroundColor: colors.inputBg, color: colors.inputText, transition: 'all 0.2s', cursor: 'pointer' }}
            >
              <option value="IRT">تومان</option>
              <option value="IRR">ریال</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '14px', 
              backgroundColor: '#2563eb', 
              color: 'white', 
              border: 'none', 
              borderRadius: '12px', 
              cursor: 'pointer', 
              fontWeight: '700',
              fontSize: '1rem',
              marginTop: '0.5rem',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              transition: 'all 0.2s'
            }}
          >
            {loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
          </button>
        </form>

        {/* دکمه بازگشت */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
          <Link 
            to="/" 
            style={{ 
              color: colors.textMuted, 
              textDecoration: 'none', 
              fontSize: '0.9rem', 
              fontWeight: '600',
              transition: 'color 0.2s'
            }}
          >
            ← بازگشت به داشبورد
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Profile;