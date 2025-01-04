import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { storage } from '../backend/storage';

interface QuotaDisplayProps {
  userId: string;
  className?: string;
}

export const QuotaDisplay: React.FC<QuotaDisplayProps> = ({ userId, className = '' }) => {
  const user = storage.getUserById(userId);
  if (!user) return null;

  // Get today's date
  const today = new Date().toISOString().split('T')[0];
  const dailyBookings = storage.getBookingsByUserAndDate(userId, today);
  const dailyCount = dailyBookings.length;
  const weeklyCount = user.bookingQuota.weekly.used;

  // Calculate percentages
  const dailyPercentage = (dailyCount / user.bookingQuota.daily.limit) * 100;
  const weeklyPercentage = (weeklyCount / user.bookingQuota.weekly.limit) * 100;

  // Determine color based on usage
  const getColorClass = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Daily Quota */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium">Today's Bookings</h3>
          </div>
          <span className="text-sm text-gray-600">
            {dailyCount} of {user.bookingQuota.daily.limit}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${getColorClass(dailyPercentage)}`}
            style={{ width: `${Math.min(dailyPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Weekly Quota */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium">Weekly Bookings</h3>
          </div>
          <span className="text-sm text-gray-600">
            {weeklyCount} of {user.bookingQuota.weekly.limit}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${getColorClass(weeklyPercentage)}`}
            style={{ width: `${Math.min(weeklyPercentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default QuotaDisplay;