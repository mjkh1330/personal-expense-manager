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
    // ارسال امن httpOnly Cookie به سرور
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

// به‌روزرسانی اطلاعات پروفایل کاربر (نام، رمز عبور، واحد پولی)
export const updateUserProfile = (userData) => {
  return apiFetch('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
};