const BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : 'http://localhost:5000/api';

export const apiFetch = async (endpoint, options = {}) => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include',
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'خطایی در برقراری ارتباط با سرور رخ داد.');
  }

  return data;
};

// گرفتن اطلاعات پروفایل کاربر
export const getUserProfile = () => {
  return apiFetch('/auth/profile', {
    method: 'GET',
  });
};

// به‌روزرسانی اطلاعات پروفایل کاربر
export const updateUserProfile = (userData) => {
  return apiFetch('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
};

// گرفتن لیست حساب‌ها و کارت‌های بانکی (برای پر شدن منوی کشویی تراکنش‌ها)
export const getAccounts = () => {
  return apiFetch('/accounts', {
    method: 'GET',
  });
};

// گرفتن لیست تراکنش‌ها
export const getTransactions = () => {
  return apiFetch('/transactions', {
    method: 'GET',
  });
};

// افزودن تراکنش جدید
export const addTransaction = (transactionData) => {
  return apiFetch('/transactions', {
    method: 'POST',
    body: JSON.stringify(transactionData),
  });
};