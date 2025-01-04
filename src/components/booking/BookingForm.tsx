import React, { useState, useEffect } from 'react';
import { AlertCircle, Calendar, Clock } from 'lucide-react';
import { useBookings } from '../../hooks/useBookings';
import { useMachines } from '../../hooks/useMachines';
import BookingCalendar from './BookingCalendar';
import TimeSlots from './TimeSlots';
import { Machine, User } from '../../backend/types';
import { PROGRAMS } from '../constants/programs';
import { storage } from '../../backend/storage';

interface BookingFormProps {
  userId: string;
  onSuccess?: () => void;
  className?: string;
}


export const BookingForm: React.FC<BookingFormProps> = ({
  userId,
  onSuccess,
  className = ''
}) => {
  const { createBooking, isLoading: isBookingLoading, error: bookingError } = useBookings();
  const { getAllMachines, isLoading: isMachinesLoading, error: machinesError } = useMachines();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [selectedMachine, setSelectedMachine] = useState<string>('');
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [isFixedSlot, setIsFixedSlot] = useState(true);
  const [availableMachines, setAvailableMachines] = useState<Machine[]>([]);
  const [userQuota, setUserQuota] = useState<User['bookingQuota'] | null>(null);
  const [dailyBookingsCount, setDailyBookingsCount] = useState(0);

  useEffect(() => {
    loadMachines();
    loadUserQuota();
  }, []);

  const loadUserQuota = () => {
    const user = storage.getUserById(userId);
    if (user) {
      setUserQuota(user.bookingQuota);
      // Get bookings for the selected date
      const dateStr = selectedDate.toISOString().split('T')[0];
      const dailyBookings = storage.getBookingsByUserAndDate(userId, dateStr);
      setDailyBookingsCount(dailyBookings.length);
    }
  };

  const loadMachines = async () => {
    const machines = await getAllMachines();
    if (machines) {
      setAvailableMachines(machines.filter(m => m.status === 'available'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTimeSlot || !selectedMachine || !selectedProgram) return;

    const program = PROGRAMS.find(p => p.id === selectedProgram);
    if (!program) return;

    const result = await createBooking({
      userId,
      machineId: selectedMachine,
      date: selectedDate.toISOString().split('T')[0],
      startTime: selectedTimeSlot,
      duration: program.duration,
      program: program.name,
      isFixedSlot,
      waterUsage: program.waterUsage,
      energyUsage: program.energyUsage,
      co2Impact: program.co2Impact
    });

    if (result) {
      loadUserQuota(); // Refresh quota after successful booking
      onSuccess?.();
    }
  };

  const isLoading = isBookingLoading || isMachinesLoading;
  const error = bookingError || machinesError;

  const handleDateSelect = (day: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(day);
    setSelectedDate(newDate);
    setSelectedTimeSlot(''); // Reset time slot when date changes
    
    // Update daily bookings count for the new date
    const dateStr = newDate.toISOString().split('T')[0];
    const dailyBookings = storage.getBookingsByUserAndDate(userId, dateStr);
    setDailyBookingsCount(dailyBookings.length);
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Booking Quota Display */}
      {userQuota && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium">Daily Quota</h3>
            </div>
            <div className="text-sm">
              <span className="font-medium">{dailyBookingsCount}</span>
              <span className="text-gray-600"> of </span>
              <span className="font-medium">{userQuota.daily.limit}</span>
              <span className="text-gray-600"> bookings for {selectedDate.toLocaleDateString()}</span>
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium">Weekly Quota</h3>
            </div>
            <div className="text-sm">
              <span className="font-medium">{userQuota.weekly.used}</span>
              <span className="text-gray-600"> of </span>
              <span className="font-medium">{userQuota.weekly.limit}</span>
              <span className="text-gray-600"> used</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setIsFixedSlot(true)}
            className={`flex-1 p-3 rounded-lg transition-colors
              ${isFixedSlot ? 'bg-blue-500 text-white' : 'bg-blue-100 hover:bg-blue-200'}
            `}
          >
            Fixed Slot
          </button>
          <button
            type="button"
            onClick={() => setIsFixedSlot(false)}
            className={`flex-1 p-3 rounded-lg transition-colors
              ${!isFixedSlot ? 'bg-blue-500 text-white' : 'bg-blue-100 hover:bg-blue-200'}
            `}
          >
            Optional Slot
          </button>
        </div>

        <BookingCalendar
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
        />

        <div className="space-y-4">
          <select
            value={selectedMachine}
            onChange={(e) => setSelectedMachine(e.target.value)}
            className="w-full p-3 border rounded-lg"
            required
          >
            <option value="">Select Machine</option>
            {availableMachines.map((machine) => (
              <option key={machine.id} value={machine.id}>
                {machine.name}
              </option>
            ))}
          </select>

          {selectedMachine && (
            <TimeSlots
              selectedDate={selectedDate}
              machineId={selectedMachine}
              onSlotSelect={(slot) => setSelectedTimeSlot(slot.time)}
              selectedSlot={selectedTimeSlot ? { time: selectedTimeSlot, available: true } : undefined}
            />
          )}

          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="w-full p-3 border rounded-lg"
            required
          >
            <option value="">Select Program</option>
            {PROGRAMS.map((program) => (
              <option key={program.id} value={program.id}>
                {program.name} ({program.duration} min)
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 
                 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
        disabled={isLoading || !selectedTimeSlot || !selectedMachine || !selectedProgram}
      >
        {isLoading ? 'Confirming...' : 'Confirm Booking'}
      </button>
    </form>
  );
};

export default BookingForm;