import React, { useState, useEffect } from 'react';
import { Settings, Save, Bell, Mail, Loader2 } from 'lucide-react';
import { getNotificationSettings, updateNotificationSettings } from '../../services/notificationService';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    appNotifications: true,
    emailNotifications: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await getNotificationSettings();
        if (response.success) {
          setSettings(response.data.notificationSettings);
        }
      } catch (error) {
        console.error('Fetch settings error:', error);
        toast.error('Failed to load notification settings.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await updateNotificationSettings(settings);
      if (response.success) {
        toast.success('Settings updated successfully!');
      }
    } catch (error) {
      console.error('Save settings error:', error);
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Settings
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Configure your notification preferences and system options
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center px-6 py-2.5 bg-gold text-black font-bold rounded-xl hover:bg-gold-dark transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer shadow-lg shadow-gold/20"
        >
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Notification Settings Card */}
        <div className="rounded-2xl border shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <div className="p-4 border-b flex items-center space-x-3" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
            <div className="p-2 rounded-lg bg-gold/10 text-gold">
              <Bell className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Communication Preferences</h2>
          </div>

          <div className="p-6 space-y-8">
            {/* App Notifications Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-4">
                <div className="mt-1 p-2 rounded-full bg-blue-500/10 text-blue-500">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>App Notifications</h3>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Receive real-time hearing reminders and system alerts within the dashboard.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.appNotifications}
                  onChange={() => handleToggle('appNotifications')}
                />
                <div className="w-14 h-7 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gold shadow-inner font-bold"></div>
              </label>
            </div>

            {/* Email Notifications Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-4">
                <div className="mt-1 p-2 rounded-full bg-purple-500/10 text-purple-500">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Email Notifications</h3>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Get hearing alerts and case updates delivered directly to your inbox.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                />
                <div className="w-14 h-7 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gold shadow-inner font-bold"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="p-4 rounded-xl border flex items-start space-x-3 bg-gold/5 border-gold/10">
          <Settings className="w-5 h-5 text-gold shrink-0 mt-0.5" />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            <strong>Note:</strong> Critical system alerts and security-related emails cannot be disabled for the safety of your account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
