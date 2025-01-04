import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Eye, EyeOff } from 'lucide-react';
import { useBookings } from '../../hooks/useBookings';
import { Booking } from '../../backend/types';

interface CurrentBookingsProps {
  userId: string;
  className?: string;
}

interface BookingCardProps {
  booking: Booking;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking }) => {
  const [showCode, setShowCode] = useState(false);

  return (
    <div className="border rounded-lg p-4 hover:border-blue-500 transition-colors">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="font-semibold">{`Machine ${booking.machineId}`}</div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(booking.date).toLocaleDateString('en-US', { 
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{booking.startTime}</span>
            </div>
          </div>
          <div className="text-sm">{booking.program} ({booking.duration} min)</div>
          
          {/* Verification Code Section - Now with smaller size */}
          <div className="mt-2 p-2 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-blue-900">Unlock Code</span>
              <button
                onClick={() => setShowCode(!showCode)}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
              >
                {showCode ? (
                  <>
                    <EyeOff className="w-3 h-3" />
                    <span className="text-xs">Hide</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3" />
                    <span className="text-xs">Show</span>
                  </>
                )}
              </button>
            </div>
            <div className="mt-1">
              <div className={`font-mono text-sm font-bold text-center py-1 px-2 bg-white rounded ${
                showCode ? 'border-blue-300 border' : 'border-transparent'
              }`}>
                {showCode ? booking.verificationCode : '• • • • • •'}
              </div>
            </div>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium
          ${booking.status === 'in-progress' 
            ? 'bg-green-100 text-green-700'
            : 'bg-blue-100 text-blue-700'
          }`}
        >
          {booking.status === 'in-progress' ? 'In Progress' : 'Upcoming'}
        </span>
      </div>
    </div>
  );
};

export const CurrentBookings: React.FC<CurrentBookingsProps> = ({
  userId,
  className = ''
}) => {
  const { getUserBookings, isLoading, error } = useBookings();
  const [currentBookings, setCurrentBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (userId) {
      loadBookings();
    }
  }, [userId]);

  const loadBookings = async () => {
    const result = await getUserBookings(userId);
    if (result) {
      // Only show upcoming and in-progress bookings
      const currentTime = new Date();
      setCurrentBookings(
        result.filter(booking => {
          const isRelevant = booking.status === 'upcoming' || booking.status === 'in-progress';
          if (!isRelevant) return false;

          // Additional check for date validity
          const bookingDate = new Date(booking.date);
          const [hours, minutes] = booking.startTime.split(':').map(Number);
          bookingDate.setHours(hours, minutes);
          return bookingDate >= currentTime;
        })
      );
    }
  };

  if (isLoading) {
    return (
      <div className="text-center text-gray-500 py-4">
        Loading bookings...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-4">
        {error}
      </div>
    );
  }

  if (currentBookings.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        No current bookings
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {currentBookings.map(booking => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  );
};

export default CurrentBookings;