import React, { useState, useEffect, useCallback } from 'react';
import { Bell, X, CheckCheck, Calendar, Info, Loader2 } from 'lucide-react';
import { getNotifications, markAsRead, createNotificationStream } from '../../services/notificationService';
import { Link } from 'react-router-dom';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const notificationSound = useCallback(() => {
    try {
      // Create a short, pleasant notification beep using Web Audio API
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.4);
    } catch (e) {
      // Silently fail if audio context is not supported
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getNotifications(5);
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // SSE Connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetchNotifications();

    const eventSource = createNotificationStream(token);

    eventSource.onmessage = (e) => {
      try {
        const newNotif = JSON.parse(e.data);
        setNotifications(prev => [newNotif, ...prev].slice(0, 5));
        setUnreadCount(prev => prev + 1);
        notificationSound();
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    };

    eventSource.onerror = () => {
      // SSE will auto-retry; no need to log
    };

    return () => eventSource.close();
  }, [fetchNotifications, notificationSound]);

  const handleMarkAllRead = async () => {
    try {
      await markAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
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
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'hearing': return <Calendar className="w-4 h-4 text-gold" />;
      default: return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);
    if (days > 0) return `${days}d ago`;
    if (hrs > 0) return `${hrs}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return 'Just now';
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        id="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gold/10 transition-colors cursor-pointer"
        style={{ color: 'var(--text-primary)' }}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div
            className="absolute right-0 mt-2 w-80 rounded-2xl border shadow-xl z-50 overflow-hidden"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-gold" />
                <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-red-500/10 text-red-500 rounded-full font-semibold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    title="Mark all as read"
                    className="p-1 rounded hover:bg-gold/10 text-gold transition-colors cursor-pointer"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-gold" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                  <Bell className="w-8 h-8 mb-2 opacity-20" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    You're all caught up!
                  </p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                  {notifications.map((notif) => (
                    <div
                      key={notif._id}
                      className={`flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer hover:bg-gold/5 ${!notif.isRead ? 'bg-gold/5' : ''}`}
                      onClick={() => !notif.isRead && handleMarkOneRead(notif._id)}
                    >
                      <div className="mt-0.5 shrink-0 p-2 rounded-lg bg-gold/10">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold leading-snug ${!notif.isRead ? 'text-gold' : ''}`} style={notif.isRead ? { color: 'var(--text-primary)' } : {}}>
                          {notif.title}
                        </p>
                        <p className="text-xs mt-0.5 leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                          {notif.message}
                        </p>
                        <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                          {timeAgo(notif.createdAt)}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <span className="mt-2 w-2 h-2 rounded-full bg-gold shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="border-t px-4 py-2.5 text-center"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <Link
                to="/dashboard/notifications"
                onClick={() => setIsOpen(false)}
                className="text-xs font-semibold text-gold hover:text-gold/80 transition-colors"
              >
                View All Notifications →
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;
