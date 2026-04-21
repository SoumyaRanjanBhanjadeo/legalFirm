import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Loader2, Calendar, Info, Trash2, ChevronLeft } from 'lucide-react';
import { getNotifications, markAsRead } from '../../services/notificationService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await getNotifications(); // Fetch all
            if (res.success) {
                setNotifications(res.data.notifications || []);
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
            toast.error('Failed to load notifications.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAllRead = async () => {
        try {
            await markAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            toast.success('All marked as read');
        } catch (err) {
            console.error('Failed to mark all read:', err);
        }
    };

    const handleMarkOneRead = async (id) => {
        try {
            await markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, isRead: true } : n)
            );
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'hearing': return <Calendar className="w-5 h-5 text-gold" />;
            default: return <Info className="w-5 h-5 text-blue-400" />;
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-xl border hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        style={{ borderColor: 'var(--border-color)' }}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                            Notifications Hub
                        </h1>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Stay updated with your case alerts and system messages
                        </p>
                    </div>
                </div>
                
                {notifications.some(n => !n.isRead) && (
                    <button
                        onClick={handleMarkAllRead}
                        className="flex items-center px-4 py-2 bg-gold/10 text-gold font-bold rounded-xl hover:bg-gold hover:text-white transition-all shadow-sm"
                    >
                        <CheckCheck className="w-4 h-4 mr-2" />
                        Mark all as read
                    </button>
                )}
            </div>

            <div className="rounded-2xl border shadow-xl overflow-hidden" 
                 style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 italic">
                        <Loader2 className="w-10 h-10 animate-spin text-gold mb-4" />
                        <p style={{ color: 'var(--text-muted)' }}>Synchronizing alerts...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center opacity-40">
                        <Bell className="w-20 h-20 mb-4" style={{ color: 'var(--text-muted)' }} />
                        <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>No Notifications Found</h3>
                        <p className="max-w-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                            When you receive alerts about hearings or case updates, they will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                        {notifications.map((notif) => (
                            <div
                                key={notif._id}
                                onClick={() => !notif.isRead && handleMarkOneRead(notif._id)}
                                className={`group flex items-start gap-5 px-6 py-5 transition-all cursor-pointer ${
                                    !notif.isRead ? 'bg-gold/5 border-l-4 border-l-gold' : 'hover:bg-gray-50 dark:hover:bg-gray-800/30 border-l-4 border-l-transparent'
                                }`}
                            >
                                <div className={`p-3 rounded-2xl ${
                                    !notif.isRead ? 'bg-gold text-white shadow-lg shadow-gold/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                }`}>
                                    {getIcon(notif.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h3 className={`text-lg font-bold ${!notif.isRead ? 'text-gold' : ''}`} style={notif.isRead ? { color: 'var(--text-primary)' } : {}}>
                                            {notif.title}
                                        </h3>
                                        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                                            {formatDate(notif.createdAt)}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                        {notif.message}
                                    </p>
                                    <div className="mt-4 flex items-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!notif.isRead && (
                                            <button className="text-xs font-bold text-gold uppercase tracking-wider">
                                                Mark as Read
                                            </button>
                                        )}
                                        <button className="text-xs font-bold text-red-500 uppercase tracking-wider flex items-center">
                                            <Trash2 className="w-3 h-3 mr-1" /> Remove
                                        </button>
                                    </div>
                                </div>
                                {!notif.isRead && (
                                    <div className="mt-2 w-3 h-3 rounded-full bg-gold shadow-[0_0_10px_rgba(184,134,11,0.5)]" />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="flex items-center justify-center space-x-2 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                <CheckCheck className="w-4 h-4" />
                <span>Your notifications are automatically updated in real-time.</span>
            </div>
        </div>
    );
};

export default NotificationsPage;
