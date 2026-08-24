import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : 'http://localhost:5000/api';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/notifications`, {
                withCredentials: true
            });
            if (response.data.success) {
                let allNotifs = response.data.notifications;
                
                const clearedTime = localStorage.getItem('clearedNotificationsTime');
                if (clearedTime) {
                    allNotifs = allNotifs.filter(n => new Date(n.createdAt).getTime() > Number(clearedTime));
                }

                const currentUnreadCount = allNotifs.filter(n => !n.isRead).length;

                setNotifications(allNotifs);
                setUnreadCount(currentUnreadCount);
            }
        } catch (error) {
            console.error('خطا در دریافت نوتیفیکیشن‌ها:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        const handleInstantUpdate = () => fetchNotifications();
        window.addEventListener('refreshNotifications', handleInstantUpdate);

        return () => {
            clearInterval(interval);
            window.removeEventListener('refreshNotifications', handleInstantUpdate);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id, e) => {
        if (e) e.stopPropagation();
        try {
            await axios.patch(`${BASE_URL}/notifications/${id}/read`, {}, {
                withCredentials: true
            });
            
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));

            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n._id !== id));
            }, 20000);

        } catch (error) {
            console.error('خطا:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await axios.patch(`${BASE_URL}/notifications/read-all`, {}, {
                withCredentials: true
            });
            
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            localStorage.setItem('clearedNotificationsTime', Date.now().toString());

            setTimeout(() => {
                setNotifications([]);
            }, 20000);

        } catch (error) {
            console.error('خطا:', error);
        }
    };

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <style>
                {`
                @keyframes bell-ring {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(15deg); }
                    50% { transform: rotate(-15deg); }
                    75% { transform: rotate(10deg); }
                }
                .bell-icon {
                    transition: all 0.3s ease;
                }
                .bell-icon.ringing {
                    animation: bell-ring 1s ease-in-out infinite;
                    color: #ef4444;
                }
                .notif-card {
                    transition: all 0.4s ease;
                    border: 1px solid transparent;
                }
                .notif-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 10px;
                }
                `}
            </style>

            <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'relative',
                    backgroundColor: unreadCount > 0 ? '#fef2f2' : '#f1f5f9',
                    border: unreadCount > 0 ? '1px solid #fecaca' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                    padding: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '14px',
                    transition: 'all 0.3s ease'
                }}
            >
                <svg 
                    className={`bell-icon ${unreadCount > 0 ? 'ringing' : ''}`}
                    style={{ width: '24px', height: '24px', color: unreadCount > 0 ? '#ef4444' : '#64748b' }} 
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>

                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '-6px',
                        right: '-6px',
                        background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                        color: 'white',
                        fontSize: '11px',
                        minWidth: '20px',
                        height: '20px',
                        padding: '0 5px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '20px',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 8px rgba(239, 68, 68, 0.4)',
                        border: '2px solid white'
                    }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    left: '0',
                    top: '120%',
                    width: '340px',
                    backgroundColor: '#ffffff',
                    borderRadius: '20px',
                    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.15)',
                    border: '1px solid #e2e8f0',
                    zIndex: 1000,
                    overflow: 'hidden',
                    textAlign: 'right'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px 20px',
                        background: 'linear-gradient(to right, #f8fafc, #ffffff)',
                        borderBottom: '1px solid #f1f5f9'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.2rem' }}>🔔</span>
                            <span style={{ fontWeight: '800', fontSize: '1rem', color: '#0f172a' }}>اعلان‌های شما</span>
                        </div>
                        {unreadCount > 0 && (
                            <button 
                                onClick={handleMarkAllAsRead}
                                style={{
                                    background: '#eff6ff',
                                    border: 'none',
                                    color: '#2563eb',
                                    fontSize: '0.8rem',
                                    padding: '6px 12px',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    fontWeight: '700',
                                    transition: 'all 0.2s'
                                }}
                            >
                                خواندن همه ✓
                            </button>
                        )}
                    </div>

                    <div className="custom-scrollbar" style={{ maxHeight: '350px', overflowY: 'auto', padding: '12px' }}>
                        {notifications.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                                <div style={{ fontSize: '3rem', opacity: '0.5', marginBottom: '10px' }}>📭</div>
                                <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0, fontWeight: '500' }}>هیچ اعلان جدیدی ندارید!</p>
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div 
                                    key={n._id} 
                                    className="notif-card"
                                    onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                                    style={{
                                        padding: '14px',
                                        marginBottom: '10px',
                                        borderRadius: '16px',
                                        cursor: n.isRead ? 'default' : 'pointer',
                                        backgroundColor: n.isRead ? '#f8fafc' : (n.type === 'danger' ? '#fef2f2' : '#fffbeb'),
                                        border: n.isRead ? '1px solid #f1f5f9' : (n.type === 'danger' ? '1px solid #fecaca' : '1px solid #fde68a'),
                                        opacity: n.isRead ? '0.7' : '1'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                        <div style={{ fontSize: '1.4rem', marginTop: '2px', filter: n.isRead ? 'grayscale(100%)' : 'none' }}>
                                            {n.type === 'danger' ? '🚨' : '⚠️'}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '800', color: n.isRead ? '#64748b' : (n.type === 'danger' ? '#b91c1c' : '#b45309') }}>
                                                    {n.title}
                                                </h4>
                                                <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '500' }}>
                                                    {new Date(n.createdAt).toLocaleDateString('fa-IR')}
                                                </span>
                                            </div>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: n.isRead ? '#94a3b8' : '#475569', lineHeight: '1.6', fontWeight: '500' }}>
                                                {n.message}
                                            </p>

                                            {!n.isRead && (
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                                                    <button 
                                                        onClick={(e) => handleMarkAsRead(n._id, e)}
                                                        style={{
                                                            background: '#f1f5f9',
                                                            border: '1px solid #cbd5e1',
                                                            color: '#334155',
                                                            fontSize: '0.75rem',
                                                            padding: '4px 10px',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            fontWeight: '600',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => e.target.style.background = '#e2e8f0'}
                                                        onMouseLeave={(e) => e.target.style.background = '#f1f5f9'}
                                                    >
                                                        ✓ خوانده شد
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;