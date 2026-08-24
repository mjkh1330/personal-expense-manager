import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const BASE_URL = import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL}/api` 
    : 'http://localhost:5000/api';

const apiFetch = async (endpoint, options = {}) => {
    const defaultHeaders = { 'Content-Type': 'application/json' };
    const config = {
        ...options,
        headers: { ...defaultHeaders, ...options.headers },
        credentials: 'include',
    };
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'خطایی در برقراری ارتباط با سرور رخ داد.');
    }
    return data;
};

export default function Accounts() {
    const { colors, isDarkMode } = useTheme();
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        name: '',
        type: 'bank_account',
        balance: '',
        cardNumber: '',
        color: '#2563eb'
    });

    const cardColors = [
        { label: 'آبی اقیانوسی', value: '#2563eb' },
        { label: 'سبز زمردی', value: '#059669' },
        { label: 'بنفش کهکشانی', value: '#7c3aed' },
        { label: 'سرخ آتشین', value: '#dc2626' },
        { label: 'خاکستری مدرن', value: '#475569' },
        { label: 'طلایی لوکس', value: '#d97706' }
    ];

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await apiFetch('/accounts', { method: 'GET' });
            setAccounts(res.data);
        } catch (err) {
            setError(err.message || 'خطا در دریافت حساب‌ها');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.cardNumber || formData.cardNumber.trim().length !== 4) {
            setError('لطفاً دقیقاً ۴ رقم آخر کارت را وارد کنید.');
            return;
        }

        try {
            setError('');
            await apiFetch('/accounts', {
                method: 'POST',
                body: JSON.stringify({ ...formData, balance: Number(formData.balance) }),
            });
            setFormData({ name: '', type: 'bank_account', balance: '', cardNumber: '', color: '#2563eb' });
            fetchAccounts();
        } catch (err) {
            setError(err.message || 'خطا در ایجاد حساب');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('آیا از حذف این حساب مطمئن هستید؟')) return;
        try {
            setError('');
            await apiFetch(`/accounts/${id}`, { method: 'DELETE' });
            fetchAccounts();
        } catch (err) {
            setError(err.message || 'خطا در حذف حساب');
        }
    };

    const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

    const getTypeLabel = (type) => {
        switch (type) {
            case 'bank_account': return 'حساب بانکی 🏦';
            case 'credit_card': return 'کارت اعتباری 💳';
            case 'cash': return 'کیف پول نقدی 💵';
            case 'savings': return 'حساب پس‌انداز 💰';
            default: return 'سایر';
        }
    };

    return (
        <div style={{ 
            minHeight: '100vh', background: colors.bgGradient, padding: '2.5rem 1rem', 
            fontFamily: 'system-ui, -apple-system, sans-serif', direction: 'rtl',
            color: colors.textMain, transition: 'background 0.3s ease, color 0.3s ease'
        }}>
            <div style={{ maxWidth: '950px', margin: '0 auto' }}>
                
                {/* هدر صفحه */}
                <div style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                    backgroundColor: colors.cardBg, padding: '1.5rem 2rem', borderRadius: '20px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', marginBottom: '2rem',
                    border: `1px solid ${colors.cardBorder}`, flexWrap: 'wrap', gap: '1rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ 
                            width: '50px', height: '50px', background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)', 
                            borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            fontSize: '1.5rem', boxShadow: '0 8px 16px rgba(37, 99, 235, 0.2)'
                        }}>💳</div>
                        <div>
                            <h1 style={{ margin: '0 0 3px 0', fontSize: '1.3rem', fontWeight: '800', color: colors.textMain }}>مدیریت حساب‌ها و کارت‌های بانکی</h1>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: colors.textMuted }}>مجموع موجودی کل حساب‌ها: <strong style={{ color: '#10b981' }}>{totalBalance.toLocaleString()} تومان</strong></p>
                        </div>
                    </div>
                    <Link to="/" style={{ 
                        backgroundColor: isDarkMode ? '#334155' : '#f1f5f9', color: colors.textMain, 
                        textDecoration: 'none', padding: '0.6rem 1.2rem', borderRadius: '12px', fontSize: '0.9rem', 
                        fontWeight: '700', border: `1px solid ${colors.cardBorder}`
                    }}>← بازگشت به داشبورد</Link>
                </div>

                {error && <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '1rem', borderRadius: '14px', marginBottom: '1.5rem', border: '1px solid #fecaca', fontWeight: '600' }}>{error}</div>}

                {/* فرم افزودن حساب جدید */}
                <div style={{ 
                    backgroundColor: colors.cardBg, padding: '2rem', borderRadius: '20px', 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)', border: `1px solid ${colors.cardBorder}`, marginBottom: '2.5rem' 
                }}>
                    <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.15rem', fontWeight: '700', color: colors.textMain }}>➕ افزودن حساب یا کارت جدید</h3>
                    
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px', color: colors.textMuted }}>نام حساب / بانک</label>
                            <input 
                                type="text" 
                                value={formData.name} 
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                                placeholder="مثال: بانک پاسارگاد"
                                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${colors.inputBorder}`, outline: 'none', backgroundColor: colors.inputBg, color: colors.inputText, boxSizing: 'border-box' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px', color: colors.textMuted }}>موجودی اولیه (تومان)</label>
                            <input 
                                type="number" 
                                value={formData.balance} 
                                onChange={(e) => setFormData({...formData, balance: e.target.value})}
                                required
                                placeholder="0"
                                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${colors.inputBorder}`, outline: 'none', backgroundColor: colors.inputBg, color: colors.inputText, boxSizing: 'border-box' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px', color: colors.textMuted }}>
                                ۴ رقم آخر کارت <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input 
                                type="text" 
                                maxLength="4"
                                minLength="4"
                                value={formData.cardNumber} 
                                onChange={(e) => setFormData({...formData, cardNumber: e.target.value.replace(/\D/g, '')})}
                                required
                                placeholder="مثلاً 6037"
                                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${colors.inputBorder}`, outline: 'none', backgroundColor: colors.inputBg, color: colors.inputText, boxSizing: 'border-box' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px', color: colors.textMuted }}>نوع حساب</label>
                            <select 
                                value={formData.type} 
                                onChange={(e) => setFormData({...formData, type: e.target.value})}
                                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${colors.inputBorder}`, outline: 'none', backgroundColor: colors.inputBg, color: colors.inputText, boxSizing: 'border-box' }}
                            >
                                <option value="bank_account">حساب بانکی 🏦</option>
                                <option value="credit_card">کارت اعتباری 💳</option>
                                <option value="cash">کیف پول نقدی 💵</option>
                                <option value="savings">حساب پس‌انداز 💰</option>
                            </select>
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px', color: colors.textMuted }}>رنگ اختصاصی کارت</label>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {cardColors.map((c) => (
                                    <button
                                        type="button"
                                        key={c.value}
                                        onClick={() => setFormData({...formData, color: c.value})}
                                        style={{
                                            backgroundColor: c.value,
                                            width: '36px', height: '36px', borderRadius: '50%',
                                            border: formData.color === c.value ? '3px solid white' : 'none',
                                            boxShadow: formData.color === c.value ? '0 0 0 2px #2563eb' : 'none',
                                            cursor: 'pointer'
                                        }}
                                        title={c.label}
                                    />
                                ))}
                            </div>
                        </div>

                        <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                            <button type="submit" style={{ 
                                width: '100%', padding: '14px', backgroundColor: '#2563eb', color: 'white', 
                                border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem',
                                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)', transition: 'background 0.2s' 
                            }}>
                                ثبت و افزودن کارت جدید 🚀
                            </button>
                        </div>
                    </form>
                </div>

                {/* لیست کارت‌ها و حساب‌ها */}
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.2rem', color: colors.textMain }}>💳 کارت‌ها و حساب‌های فعال شما</h3>
                
                {loading ? (
                    <p style={{ textAlign: 'center', color: colors.textMuted, padding: '2rem' }}>در حال بارگذاری حساب‌ها...</p>
                ) : accounts.length === 0 ? (
                    <div style={{ backgroundColor: colors.cardBg, padding: '3rem', borderRadius: '20px', textAlign: 'center', border: `1px solid ${colors.cardBorder}` }}>
                        <p style={{ color: colors.textMuted, margin: 0 }}>هنوز هیچ حساب یا کارتی ثبت نکرده‌اید! از فرم بالا اولین کارت خود را بسازید.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {accounts.map((acc) => (
                            <div key={acc._id} style={{ 
                                background: `linear-gradient(135deg, ${acc.color || '#2563eb'} 0%, #0f172a 100%)`, 
                                borderRadius: '20px', padding: '1.75rem', color: 'white', 
                                boxShadow: '0 10px 20px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', 
                                justifyContent: 'space-between', minHeight: '180px', position: 'relative', overflow: 'hidden'
                            }}>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                        <div>
                                            <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '8px', fontWeight: '600' }}>
                                                {getTypeLabel(acc.type)}
                                            </span>
                                            <h4 style={{ margin: '10px 0 0 0', fontSize: '1.2rem', fontWeight: '800' }}>{acc.name}</h4>
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(acc._id)}
                                            style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: 'none', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
                                        >
                                            حذف
                                        </button>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '20px' }}>
                                    <div>
                                        <span style={{ fontSize: '0.75rem', opacity: 0.8, display: 'block', marginBottom: '2px' }}>شماره کارت / حساب</span>
                                        <span style={{ fontSize: '1rem', letterSpacing: '2px', fontWeight: '600' }}>**** **** **** {acc.cardNumber || '----'}</span>
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <span style={{ fontSize: '0.75rem', opacity: 0.8, display: 'block', marginBottom: '2px' }}>موجودی</span>
                                        <span style={{ fontSize: '1.3rem', fontWeight: '900', direction: 'ltr', display: 'block' }}>{acc.toLocaleString ? acc.balance.toLocaleString() : acc.balance} <span style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>تومان</span></span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}