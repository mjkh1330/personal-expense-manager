import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // ۱. بررسی می‌کنیم که آیا کاربر قبلاً تم رو ذخیره کرده یا نه؟
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('app_theme');
    return savedTheme === 'dark' ? true : false;
  });

  // ۲. هر بار که isDarkMode تغییر کرد، اون رو تو مرورگر ذخیره می‌کنیم
  useEffect(() => {
    localStorage.setItem('app_theme', isDarkMode ? 'dark' : 'light');
    
    // (اختیاری) اضافه کردن کلاس به بادی برای تغییر رنگ بک‌گراند کل صفحه
    if (isDarkMode) {
      document.body.style.backgroundColor = '#0f172a'; // رنگ پس‌زمینه دارک
    } else {
      document.body.style.backgroundColor = '#f8fafc'; // رنگ پس‌زمینه لایت
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // ۳. تعریف متغیرهای رنگی برای استفاده در تمام صفحات
  const colors = {
    bgGradient: isDarkMode 
      ? 'linear-gradient(to bottom right, #0f172a, #1e293b)' 
      : 'linear-gradient(to bottom right, #f8fafc, #f1f5f9)',
    cardBg: isDarkMode ? '#1e293b' : '#ffffff',
    cardBorder: isDarkMode ? '#334155' : '#e2e8f0',
    textMain: isDarkMode ? '#f8fafc' : '#0f172a',
    textMuted: isDarkMode ? '#94a3b8' : '#64748b',
    inputBg: isDarkMode ? '#0f172a' : '#ffffff',
    inputBorder: isDarkMode ? '#475569' : '#cbd5e1',
    inputText: isDarkMode ? '#f8fafc' : '#0f172a',
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);