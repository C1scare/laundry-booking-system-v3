import React, { useState, useEffect } from 'react';
import { useBookings } from '../../hooks/useBookings';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface TimeSlotsProps {
  selectedDate: Date;
  machineId: string;
  onSlotSelect: (slot: TimeSlot) => void;
  selectedSlot?: TimeSlot;
  currentBookingId?: string;  // Add this to exclude current booking from availability check
  className?: string;
}

export const TimeSlots: React.FC<TimeSlotsProps> = ({
  selectedDate,
  machineId,
  onSlotSelect,
  selectedSlot,
  currentBookingId,
  className = ''
}) => {
  const { checkAvailability, getUserBookings, isLoading: isCheckingAvailability } = useBookings();
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAvailability();
  }, [selectedDate, machineId]);

  const loadAvailability = async () => {
    setIsLoading(true);
    const timeSlots: TimeSlot[] = [];
    const dateStr = selectedDate.toISOString().split('T')[0];
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Generate slots from 6:00 to 22:00
    for (let hour = 6; hour <= 22; hour++) {
      const timeStr = `${hour.toString().padStart(2, '0')}:00`;
      
      // Check if the slot is in the past
      const slotDate = new Date(selectedDate);
      slotDate.setHours(hour, 0, 0, 0);
      const isPast = slotDate < now;

      if (dateStr < today || isPast) {
        timeSlots.push({ time: timeStr, available: false });
      } else {
        const availability = await checkAvailability(machineId, dateStr, timeStr);
        const isCurrentBookingSlot = availability && currentBookingId && selectedSlot?.time === timeStr;
        timeSlots.push({
          time: timeStr,
          available: isCurrentBookingSlot || (availability ?? false)
        });
      }
    }

    setSlots(timeSlots);
    setIsLoading(false);
  };

  if (isLoading || isCheckingAvailability) {
    return (
      <div className="text-center py-4 text-gray-500">
        Loading available slots...
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <h3 className="font-semibold text-lg mb-4">Available Time Slots</h3>
      <div className="grid grid-cols-2 gap-2">
        {slots.map((slot, index) => (
          <button
            key={`${slot.time}-${index}`}
            onClick={() => slot.available && onSlotSelect(slot)}
            disabled={!slot.available}
            className={`
              p-3 rounded-lg transition-colors
              ${slot.available 
                ? selectedSlot?.time === slot.time
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-green-100 hover:bg-green-200'
                : 'bg-red-100 cursor-not-allowed'
              }
            `}
          >
            <div className="flex flex-col">
              <span className="font-medium">{slot.time}</span>
              <span className="text-sm">
                {slot.available ? 'Available' : 'Booked'}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeSlots;