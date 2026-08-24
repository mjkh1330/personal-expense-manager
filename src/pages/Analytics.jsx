import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext'; 
import {
  PieChart, Pie, Cell, Tooltip as PieTooltip, Legend as PieLegend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as BarTooltip, Legend as BarLegend
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

// ۱. تابع برای وسط‌چین کردن درصدهای نمودار دایره‌ای (دقیقاً مثل داشبورد)
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent === 0) return null; 

  return (
    <text 
      x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" 
      fontWeight="bold" fontSize="14"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ۲. تابع برای خلاصه‌سازی اعداد بزرگ در محور Y نمودار ستونی
const formatYAxis = (value) => {
  if (value === 0) return '0';
  if (value >= 1000000000) return (value / 1000000000).toFixed(1) + ' میلیارد';
  if (value >= 1000000) return (value / 1000000).toFixed(1) + ' میلیون';
  if (value >= 1000) return (value / 1000).toFixed(0) + ' هزار';
  return value.toLocaleString();
};

const Analytics = () => {
  const { colors, isDarkMode } = useTheme(); 
  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/transactions/analytics', {
          withCredentials: true
        });

        const data = response.data.data;

        const formattedPieData = data.expensesByCategory.map(item => ({
          name: item._id,
          value: item.totalAmount
        }));

        const formattedBarData = data.monthlyTrend.map(item => ({
          name: `${item._id.year}/${item._id.month}`,
          درآمد: item.totalIncome,
          هزینه: item.totalExpense
        }));

        setPieData(formattedPieData);
        setBarData(formattedBarData);
        setLoading(false);
      } catch (error) {
        console.error('خطا در دریافت اطلاعات نمودارها:', error);
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: colors.bgGradient, display: 'flex', justifyContent: 'center', alignItems: 'center', color: colors.textMain }}>
        <h2>در حال بارگذاری تحلیل‌ها... ⏳</h2>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', background: colors.bgGradient, padding: '2.5rem 1rem', 
      fontFamily: 'system-ui, -apple-system, sans-serif', direction: 'rtl',
      color: colors.textMain, transition: 'background 0.3s ease, color 0.3s ease'
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* هدر صفحه */}
        <header style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          backgroundColor: colors.cardBg, padding: '1.5rem 2rem', borderRadius: '20px', 
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', marginBottom: '2.5rem', 
          border: `1px solid ${colors.cardBorder}`, flexWrap: 'wrap', gap: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ 
              width: '52px', height: '52px', background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', 
              borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontSize: '1.6rem', boxShadow: '0 8px 16px rgba(139, 92, 246, 0.2)'
            }}>
              📈
            </div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', color: colors.textMain, fontWeight: '800' }}>
              تحلیل پیشرفته دخل و خرج
            </h2>
          </div>
          
          <Link to="/" style={{ 
            backgroundColor: isDarkMode ? '#334155' : '#f1f5f9', color: colors.textMain, 
            textDecoration: 'none', padding: '0.75rem 1.5rem', borderRadius: '12px', 
            fontSize: '0.95rem', fontWeight: '700', border: `1px solid ${colors.cardBorder}`,
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            🔙 بازگشت به داشبورد
          </Link>
        </header>

        {/* بخش نمودارها */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }}>
          
          {/* کارت نمودار دایره‌ای */}
          <div style={{ 
            backgroundColor: colors.cardBg, padding: '2rem', borderRadius: '20px', 
            border: `1px solid ${colors.cardBorder}`, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)' 
          }}>
            <h3 style={{ textAlign: 'center', marginBottom: '2rem', color: colors.textMain, borderBottom: `1px dashed ${colors.cardBorder}`, paddingBottom: '1rem' }}>
              هزینه‌ها روی چه چیزهایی صرف شده؟
            </h3>
            {pieData.length === 0 ? (
              <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textMuted }}>
                <p>شما هنوز هیچ هزینه‌ای ثبت نکرده‌اید! 🤷‍♂️</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie 
                    data={pieData} 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={120} 
                    dataKey="value" 
                    labelLine={false} // غیرفعال کردن خطوط مزاحم
                    label={renderCustomizedLabel} // استفاده از لیبل درصدی تمیز
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={colors.cardBg} strokeWidth={2} />
                    ))}
                  </Pie>
                  <PieTooltip 
                    formatter={(value) => `${value.toLocaleString()} تومان`} 
                    contentStyle={{ borderRadius: '12px', backgroundColor: colors.cardBg, border: `1px solid ${colors.cardBorder}`, color: colors.textMain }}
                  />
                  <PieLegend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* کارت نمودار ستونی */}
          <div style={{ 
            backgroundColor: colors.cardBg, padding: '2rem', borderRadius: '20px', 
            border: `1px solid ${colors.cardBorder}`, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)' 
          }}>
            <h3 style={{ textAlign: 'center', marginBottom: '2rem', color: colors.textMain, borderBottom: `1px dashed ${colors.cardBorder}`, paddingBottom: '1rem' }}>
              روند درآمد و هزینه در ماه‌های مختلف
            </h3>
            {barData.length === 0 ? (
              <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textMuted }}>
                <p>تراکنشی برای نمایش وجود ندارد! 🤷‍♂️</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={barData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} vertical={false} />
                  <XAxis dataKey="name" stroke={colors.textMuted} fontSize={12} tickMargin={10} />
                  {/* افزایش عرض YAxis برای جا شدن اعداد و استفاده از تابع خلاصه‌ساز */}
                  <YAxis width={80} stroke={colors.textMuted} fontSize={12} tickFormatter={formatYAxis} />
                  <BarTooltip 
                    formatter={(value) => `${value.toLocaleString()} تومان`} 
                    contentStyle={{ borderRadius: '12px', backgroundColor: colors.cardBg, border: `1px solid ${colors.cardBorder}`, color: colors.textMain }}
                    cursor={{fill: isDarkMode ? '#1e293b' : '#f1f5f9'}}
                  />
                  <BarLegend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="درآمد" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={60} />
                  <Bar dataKey="هزینه" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Analytics;