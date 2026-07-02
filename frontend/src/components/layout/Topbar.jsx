import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { Bell, LogOut, Moon, User as UserIcon } from 'lucide-react';
import client from '../../api/client';

export default function Topbar() {
  const { user, logout } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await client.get('/notifications');
        if (res.data?.success) {
          setNotifications(res.data.data.notifications || []);
        }
      } catch (err) {
        console.error('Failed to load notifications:', err);
      }
    };
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllRead = async () => {
    try {
      await client.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="h-16 border-b border-[#2e254f] bg-[#0f0a1c]/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-40">
      <div>
        <h2 className="text-lg font-semibold tracking-wide capitalize">
          Welcome back, {user?.firstName}
        </h2>
      </div>

      <div className="flex items-center gap-6">
        {/* Notifications Icon */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowNotif(!showNotif);
              if (!showNotif && unreadCount > 0) markAllRead();
            }}
            className="p-2 hover:bg-white/5 rounded-lg text-brand-muted hover:text-white transition-all relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-teal ring-4 ring-[#0f0a1c]"></span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 mt-2 w-80 bg-[#18132b] border border-[#2e254f] rounded-xl shadow-2xl p-4 z-50">
              <div className="flex justify-between items-center pb-2 border-b border-[#2e254f] mb-2">
                <span className="text-sm font-semibold">Notifications</span>
                <span className="text-xs text-brand-teal">{unreadCount} unread</span>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-brand-muted text-center py-4">No notifications yet</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`p-2 rounded-lg text-xs ${n.isRead ? 'bg-transparent' : 'bg-white/5'}`}>
                      <p className="font-semibold text-white">{n.title}</p>
                      <p className="text-brand-muted mt-0.5">{n.body}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button 
          onClick={logout}
          className="flex items-center gap-2 px-3 py-1.5 border border-red-500/30 hover:border-red-500 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-semibold tracking-wide transition-all"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </header>
  );
}
