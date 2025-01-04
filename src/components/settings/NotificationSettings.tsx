import React, { useState } from 'react';
import { Bell, Mail, MessageSquare } from 'lucide-react';

interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  machineAvailable: boolean;
  bookingReminder: boolean;
  washingComplete: boolean;
  machineError: boolean;
}

interface NotificationSettingsProps {
  initialPreferences?: Partial<NotificationPreferences>;
  onSave: (preferences: NotificationPreferences) => Promise<void>;
  className?: string;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  initialPreferences = {},
  onSave,
  className = ''
}) => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: initialPreferences.email ?? false,
    push: initialPreferences.push ?? false,
    sms: initialPreferences.sms ?? false,
    machineAvailable: initialPreferences.machineAvailable ?? false,
    bookingReminder: initialPreferences.bookingReminder ?? false,
    washingComplete: initialPreferences.washingComplete ?? false,
    machineError: initialPreferences.machineError ?? false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSaving(true);

    try {
      await onSave(preferences);
      setSuccessMessage('Settings saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const ToggleSection = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <div className="space-y-3">
      <div className="flex items-center space-x-2 font-medium">
        {icon}
        <h3>{title}</h3>
      </div>
      <div className="space-y-2 ml-8">
        {children}
      </div>
    </div>
  );

  const Toggle = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) => (
    <label className="flex items-center space-x-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <span className="text-sm">{label}</span>
    </label>
  );

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="p-3 bg-green-100 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}

      <div className="space-y-6">
        <ToggleSection title="Notification Methods" icon={<Bell className="w-5 h-5" />}>
          <Toggle
            label="Email Notifications"
            checked={preferences.email}
            onChange={(checked) => setPreferences(prev => ({ ...prev, email: checked }))}
          />
          <Toggle
            label="Push Notifications"
            checked={preferences.push}
            onChange={(checked) => setPreferences(prev => ({ ...prev, push: checked }))}
          />
          <Toggle
            label="SMS Notifications"
            checked={preferences.sms}
            onChange={(checked) => setPreferences(prev => ({ ...prev, sms: checked }))}
          />
        </ToggleSection>

        <ToggleSection title="Notification Conditions" icon={<MessageSquare className="w-5 h-5" />}>
          <Toggle
            label="When machine becomes available"
            checked={preferences.machineAvailable}
            onChange={(checked) => setPreferences(prev => ({ ...prev, machineAvailable: checked }))}
          />
          <Toggle
            label="15 minutes before booking"
            checked={preferences.bookingReminder}
            onChange={(checked) => setPreferences(prev => ({ ...prev, bookingReminder: checked }))}
          />
          <Toggle
            label="When washing is complete"
            checked={preferences.washingComplete}
            onChange={(checked) => setPreferences(prev => ({ ...prev, washingComplete: checked }))}
          />
          <Toggle
            label="If machine has error"
            checked={preferences.machineError}
            onChange={(checked) => setPreferences(prev => ({ ...prev, machineError: checked }))}
          />
        </ToggleSection>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 
                 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
      >
        {isSaving ? 'Saving...' : 'Save Preferences'}
      </button>
    </form>
  );
};

export default NotificationSettings;