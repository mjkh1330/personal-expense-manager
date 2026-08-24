import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : 'http://localhost:5000/api';

const Categories = () => {
  const { colors, isDarkMode } = useTheme();

  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('expense');
  const [color, setColor] = useState('#3b82f6');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/categories`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (err) {
      console.error('خطا در دریافت دسته‌بندی‌ها:', err);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post(
        `${BASE_URL}/categories`,
        { name, type, color },
        { withCredentials: true }
      );
      if (response.data.success) {
        setCategories([...categories, response.data.data]);
        setName('');
        setColor('#3b82f6');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'خطایی در ثبت دسته‌بندی رخ داد.');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('آیا از حذف این دسته‌بندی مطمئن هستید؟')) return;
    try {
      const response = await axios.delete(`${BASE_URL}/categories/${id}`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setCategories(categories.filter((cat) => cat._id !== id));
      }
    } catch (err) {
      console.error('خطا در حذف دسته‌بندی:', err);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', background: colors.bgGradient, padding: '2.5rem 1rem', 
      fontFamily: 'system-ui, -apple-system, sans-serif', direction: 'rtl',
      color: colors.textMain, transition: 'background 0.3s ease, color 0.3s ease'
    }}>
      <div style={{ maxWidth: '750px', margin: '0 auto' }}>
        
        <div style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          backgroundColor: colors.cardBg, padding: '1.5rem 2rem', borderRadius: '20px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', marginBottom: '2rem',
          border: `1px solid ${colors.cardBorder}`
        }}>
          <div>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '1.4rem', fontWeight: '800', color: colors.textMain }}>
              📁 مدیریت دسته‌بندی‌های سفارشی
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: colors.textMuted }}>
              دسته‌های دلخواه خودتان را برای درآمدها و هزینه‌ها بسازید و مدیریت کنید.
            </p>
          </div>
          <Link to="/" style={{ 
            backgroundColor: isDarkMode ? '#334155' : '#f1f5f9', color: colors.textMain, 
            textDecoration: 'none', padding: '0.6rem 1.2rem', borderRadius: '12px', fontSize: '0.9rem', 
            fontWeight: '700', border: `1px solid ${colors.cardBorder}`, transition: 'all 0.2s'
          }}>
            ← بازگشت به داشبورد
          </Link>
        </div>

        {error && (
          <div style={{ 
            padding: '12px 16px', backgroundColor: '#fef2f2', color: '#dc2626', 
            borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #fecaca', fontSize: '0.9rem', fontWeight: '600' 
          }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ 
          background: colors.cardBg, padding: '2rem', borderRadius: '20px', 
          border: `1px solid ${colors.cardBorder}`, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
          marginBottom: '2rem'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.15rem', fontWeight: '700', color: colors.textMain }}>
            ➕ افزودن دسته‌بندی جدید
          </h3>
          
          <form onSubmit={handleAddCategory} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <input
              type="text"
              placeholder="نام دسته‌بندی (مثلاً حقوق، پاداش، تفریح...)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ 
                padding: '12px 16px', borderRadius: '12px', border: `1px solid ${colors.inputBorder}`, 
                outline: 'none', fontSize: '0.95rem', backgroundColor: colors.inputBg, color: colors.inputText 
              }}
            />
            
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)} 
              style={{ 
                padding: '12px 16px', borderRadius: '12px', border: `1px solid ${colors.inputBorder}`, 
                outline: 'none', fontSize: '0.95rem', backgroundColor: colors.inputBg, color: colors.inputText 
              }}
            >
              <option value="expense">هزینه (Expense) 🔴</option>
              <option value="income">درآمد (Income) 🟢</option>
            </select>

            <div style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
              padding: '0 12px', borderRadius: '12px', border: `1px solid ${colors.inputBorder}`, 
              backgroundColor: colors.inputBg 
            }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '600', color: colors.textMuted }}>رنگ نمایش:</span>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ border: 'none', width: '36px', height: '36px', cursor: 'pointer', background: 'transparent' }}
              />
            </div>

            <button 
              type="submit" 
              style={{ 
                gridColumn: '1 / -1', padding: '14px', backgroundColor: '#2563eb', color: '#fff', 
                border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)', transition: 'background-color 0.2s' 
              }}
            >
              ثبت و ذخیره دسته‌بندی
            </button>
          </form>
        </div>

        <div style={{ 
          background: colors.cardBg, padding: '2rem', borderRadius: '20px', 
          border: `1px solid ${colors.cardBorder}`, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)' 
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.15rem', fontWeight: '700', color: colors.textMain }}>
            📋 دسته‌بندی‌های ذخیره‌شده شما
          </h3>

          {categories.length === 0 ? (
            <p style={{ color: colors.textMuted, textAlign: 'center', padding: '2rem 0', margin: 0, fontSize: '0.95rem' }}>
              هنوز دسته‌بندی سفارشی ثبت نکرده‌اید.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {categories.map((cat) => (
                <div
                  key={cat._id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.1rem 1.4rem',
                    backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
                    borderRadius: '14px',
                    border: `1px solid ${colors.cardBorder}`,
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: cat.color || '#3b82f6',
                        display: 'inline-block',
                        boxShadow: `0 0 8px ${cat.color || '#3b82f6'}66`
                      }}
                    ></span>
                    <div>
                      <strong style={{ fontSize: '1rem', color: colors.textMain }}>{cat.name}</strong>
                      <div style={{ marginTop: '2px' }}>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          color: cat.type === 'income' ? '#10b981' : '#f43f5e', 
                          backgroundColor: isDarkMode ? '#334155' : '#e2e8f0', 
                          padding: '2px 8px', 
                          borderRadius: '6px', 
                          fontWeight: '600' 
                        }}>
                          {cat.type === 'income' ? 'درآمد 🟢' : 'هزینه 🔴'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteCategory(cat._id)}
                    style={{ 
                      backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', 
                      padding: '7px 14px', borderRadius: '10px', cursor: 'pointer', 
                      fontSize: '0.85rem', fontWeight: '700', transition: 'background-color 0.2s' 
                    }}
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Categories;