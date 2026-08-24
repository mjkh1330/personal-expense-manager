import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currency, setCurrency] = useState('IRT');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({ name, email, password, currency });
      navigate('/');
    } catch (err) {
      setError(err.message || 'خطایی در ثبت‌نام رخ داد.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', 
      padding: '3rem 1.5rem', 
      fontFamily: 'system-ui, -apple-system, sans-serif', 
      direction: 'rtl',
      color: '#1e293b',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '440px', 
        background: '#ffffff', 
        borderRadius: '24px', 
        padding: '2.5rem', 
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid rgba(226, 232, 240, 0.8)'
      }}>
        
        {/* لوگو و هدر */}
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
            🪙
          </div>
          <h1 style={{ margin: '0 0 5px 0', fontSize: '1.5rem', color: '#0f172a', fontWeight: '800' }}>ساخت حساب کاربری</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>به سامانه دخل‌وخرج بپیوندید</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '1.5rem', border: '1px solid #fecaca', textAlign: 'center', fontWeight: '500' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
          <div>
            <label htmlFor="name" style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>نام و نام خانوادگی</label>
            <input
              type="text"
              id="name"
              placeholder="مثلاً علی رضایی"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: '100%', boxSizing: 'border-box', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem', backgroundColor: '#f8fafc', transition: 'all 0.2s' }}
            />
          </div>

          <div>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>ایمیل</label>
            <input
              type="email"
              id="email"
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', boxSizing: 'border-box', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem', backgroundColor: '#f8fafc', transition: 'all 0.2s' }}
            />
          </div>

          <div>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>رمز عبور (حداقل ۶ کاراکتر)</label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{ width: '100%', boxSizing: 'border-box', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem', backgroundColor: '#f8fafc', transition: 'all 0.2s' }}
            />
          </div>

          <div>
            <label htmlFor="currency" style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>واحد پولی پیش‌فرض</label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem', backgroundColor: '#f8fafc', transition: 'all 0.2s', cursor: 'pointer' }}
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
            {loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام در دخل‌وخرج'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: '#64748b' }}>
          قبلاً ثبت‌نام کرده‌اید؟ <Link to="/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '700' }}>وارد شوید</Link>
        </div>

      </div>
    </div>
  );
};

export default Register;