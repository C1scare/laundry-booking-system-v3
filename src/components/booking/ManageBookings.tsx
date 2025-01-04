import React, { useState, useEffect } from 'react';
import { AlertTriangle, WashingMachine, User, Calendar, Clock, Settings, Edit2, Trash2, History, LineChart } from 'lucide-react';
import _ from 'lodash';
import { useBookings } from '../../hooks/useBookings';
import { Booking } from '../../backend/types';
import BookingCalendar from '../booking/BookingCalendar';
import TimeSlots from '../booking/TimeSlots';
import { PROGRAMS } from '../constants/programs';

type ManageBookingsTab = 'current' | 'history' | 'sustainability';
type ModifyType = 'time' | 'program' | 'slotType' | null;

interface ManageBookingsProps {
  userId: string;
  selectedAction?: string;
  initialTab?: ManageBookingsTab;
}

export const ManageBookings: React.FC<ManageBookingsProps> = ({
  userId,
  initialTab = 'current'
}) => {
  const { getUserBookings, modifyBooking, cancelBooking, isLoading, error } = useBookings();
  const [activeTab, setActiveTab] = useState<ManageBookingsTab>(initialTab);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [modifyType, setModifyType] = useState<ModifyType>(null);
  const [newDate, setNewDate] = useState<Date | null>(null);
  const [newTimeSlot, setNewTimeSlot] = useState<string>('');
  const [newProgram, setNewProgram] = useState<string>('');
  const [isFixedSlot, setIsFixedSlot] = useState<boolean>(true);
  // Add state for showing cancelled bookings
  const [showCancelled, setShowCancelled] = useState(false);

  useEffect(() => {
    if (userId) {
      loadBookings();
    }
  }, [userId]);

  const loadBookings = async () => {
    const result = await getUserBookings(userId);
    if (result) {
      setUserBookings(result);
    }
  };

  const handleModify = (booking: Booking, type: ModifyType) => {
    setSelectedBooking(booking);
    setModifyType(type);
    if (type === 'time') {
      setNewDate(new Date(booking.date));
      setNewTimeSlot(booking.startTime);
    } else if (type === 'program') {
      setNewProgram(booking.program);
    } else if (type === 'slotType') {
      setIsFixedSlot(booking.isFixedSlot);
    }
  };

  const handleSaveModification = async () => {
    if (!selectedBooking) return;

    let updates: Partial<Booking> = {};

    if (modifyType === 'time' && newDate && newTimeSlot) {
      updates = {
        date: newDate.toISOString().split('T')[0],
        startTime: newTimeSlot
      };
    } else if (modifyType === 'program') {
      const program = PROGRAMS.find(p => p.id === newProgram);
      if (program) {
        updates = {
          program: program.name,
          duration: program.duration
        };
      }
    } else if (modifyType === 'slotType') {
      updates = {
        isFixedSlot
      };
    }

    const result = await modifyBooking(selectedBooking.id, updates);
    if (result) {
      loadBookings();
      closeModifyDialog();
    }
  };

  const closeModifyDialog = () => {
    setSelectedBooking(null);
    setModifyType(null);
    setNewDate(null);
    setNewTimeSlot('');
    setNewProgram('');
  };

  const handleCancel = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      const result = await cancelBooking(bookingId);
      if (result) {
        loadBookings();
      }
    }
  };

  const ModifyDialog = () => {
    if (!selectedBooking || !modifyType) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-lg p-6 max-w-md w-full my-4 relative">
          <h3 className="text-lg font-semibold mb-4">
            {modifyType === 'time' && 'Modify Time'}
            {modifyType === 'program' && 'Change Program'}
            {modifyType === 'slotType' && 'Change Slot Type'}
          </h3>

          <div className="max-h-[70vh] overflow-y-auto pr-2">
            {modifyType === 'time' && (
              <div className="space-y-4">
                <BookingCalendar
                  selectedDate={newDate || new Date()}
                  onDateSelect={(day) => {
                    const date = new Date(newDate || new Date());
                    date.setDate(day);
                    setNewDate(date);
                  }}
                />
                {newDate && (
                  <TimeSlots
                    selectedDate={newDate}
                    machineId={selectedBooking.machineId}
                    onSlotSelect={(slot) => setNewTimeSlot(slot.time)}
                    selectedSlot={newTimeSlot ? { time: newTimeSlot, available: true } : undefined}
                    currentBookingId={selectedBooking.id}
                  />
                )}
              </div>
            )}

            {modifyType === 'program' && (
              <select
                value={newProgram}
                onChange={(e) => setNewProgram(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Select Program</option>
                {PROGRAMS.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name} ({program.duration} min)
                  </option>
                ))}
              </select>
            )}

            {modifyType === 'slotType' && (
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
            )}
          </div>

          <div className="mt-6 flex space-x-4 sticky bottom-0 bg-white pt-4 border-t">
            <button
              onClick={closeModifyDialog}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveModification}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  };

  const TabButton = ({ tab, label }: { tab: ManageBookingsTab; label: string }) => (
    <button
      type="button"
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 rounded-lg transition-colors ${
        activeTab === tab 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-100 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );

  const renderCurrentBookings = () => {
    const currentBookings = userBookings.filter(b => 
      b.status === 'upcoming' || b.status === 'in-progress'
    );

    if (currentBookings.length === 0) {
      return (
        <div className="text-center text-gray-500 py-4">
          No upcoming bookings
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {currentBookings.map(booking => (
          <div key={booking.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">Machine {booking.machineId}</h3>
                <p className="text-sm text-gray-600">
                  {new Date(booking.date).toLocaleDateString()} at {booking.startTime}
                </p>
                <p className="text-sm">{booking.program} ({booking.duration} min)</p>
                <p className="text-sm text-gray-600">
                  {booking.isFixedSlot ? 'Fixed Slot' : 'Optional Slot'}
                </p>
              </div>
              <div className="flex space-x-2">
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => handleModify(booking, 'time')}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Modify Time"
                  >
                    <Clock className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleModify(booking, 'program')}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Change Program"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleModify(booking, 'slotType')}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Change Slot Type"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => handleCancel(booking.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Cancel Booking"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderBookingHistory = () => {
    const completedBookings = userBookings.filter(b => 
      b.status === 'completed' || (showCancelled && b.status === 'cancelled')
    );

    if (completedBookings.length === 0) {
      return (
        <div className="text-center text-gray-500 py-4">
          No booking history
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-end mb-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showCancelled}
              onChange={(e) => setShowCancelled(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">Show cancelled bookings</span>
          </label>
        </div>
        {completedBookings.map(booking => (
          <div key={booking.id} className="border rounded-lg p-4 bg-gray-50">
            <div className="space-y-2">
              <div className="font-semibold">Machine {booking.machineId}</div>
              <div className="text-sm text-gray-600">
                {new Date(booking.date).toLocaleDateString()} at {booking.startTime}
              </div>
              <div className="text-sm">{booking.program} ({booking.duration} min)</div>
              <div className="text-xs text-gray-500">
                Water: {booking.waterUsage}L • 
                Energy: {booking.energyUsage}kWh • 
                CO₂: {booking.co2Impact}kg
              </div>
              <div className={`text-sm ${
                booking.status === 'completed' ? 'text-green-600' : 'text-red-600'
              }`}>
                Status: {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSustainabilityReport = () => {
    const completedBookings = userBookings.filter(b => b.status === 'completed');
    const totalWater = completedBookings.reduce((sum, b) => sum + (b.waterUsage || 0), 0);
    const totalEnergy = completedBookings.reduce((sum, b) => sum + (b.energyUsage || 0), 0);
    const totalCO2 = completedBookings.reduce((sum, b) => sum + (b.co2Impact || 0), 0);

    // Group bookings by month
    const bookingsByMonth = _.groupBy(completedBookings, b => {
      const date = new Date(b.date);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    });

    // Sort months in descending order
    const sortedMonths = Object.keys(bookingsByMonth).sort().reverse();

    // Calculate current month's statistics
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const currentMonthBookings = bookingsByMonth[currentMonth] || [];

    return (
      <div className="space-y-8">
        {/* Current Month Overview */}
        <div>
          <h3 className="font-semibold mb-4">Current Month Overview</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-lg font-semibold text-blue-700">
                {_.sumBy(currentMonthBookings, 'waterUsage').toFixed(1)}L
              </div>
              <div className="text-sm text-blue-600">Water Usage</div>
              <div className="text-xs text-blue-500 mt-1">
                {currentMonthBookings.length} completed washes
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-lg font-semibold text-green-700">
                {_.sumBy(currentMonthBookings, 'energyUsage').toFixed(1)}kWh
              </div>
              <div className="text-sm text-green-600">Energy Usage</div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="text-lg font-semibold text-yellow-700">
                {_.sumBy(currentMonthBookings, 'co2Impact').toFixed(1)}kg
              </div>
              <div className="text-sm text-yellow-600">CO₂ Impact</div>
            </div>
          </div>
        </div>

        {/* Monthly History */}
        <div>
          <h3 className="font-semibold mb-4">Monthly History</h3>
          <div className="space-y-4">
            {sortedMonths.map(month => {
              const monthBookings = bookingsByMonth[month];
              const monthDate = new Date(month + '-01');
              const isCurrentMonth = month === currentMonth;
              
              return (
                <div key={month} className={`border rounded-lg p-4 ${isCurrentMonth ? 'bg-blue-50' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">
                      {monthDate.toLocaleDateString('default', { 
                        month: 'long',
                        year: 'numeric'
                      })}
                      {isCurrentMonth && ' (Current)'}
                    </h4>
                    <span className="text-sm text-gray-500">
                      {monthBookings.length} completed washes
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm font-medium">Water Usage</div>
                      <div className="text-lg">
                        {_.sumBy(monthBookings, 'waterUsage').toFixed(1)}L
                      </div>
                      <div className="text-xs text-gray-500">
                        {monthBookings.length > 0 ? 
                          `Avg: ${(_.sumBy(monthBookings, 'waterUsage') / monthBookings.length).toFixed(1)}L per wash` :
                          'No data available'
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Energy Usage</div>
                      <div className="text-lg">
                        {_.sumBy(monthBookings, 'energyUsage').toFixed(1)}kWh
                      </div>
                      <div className="text-xs text-gray-500">
                        {monthBookings.length > 0 ?
                          `Avg: ${(_.sumBy(monthBookings, 'energyUsage') / monthBookings.length).toFixed(1)}kWh per wash` :
                          'No data available'
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">CO₂ Impact</div>
                      <div className="text-lg">
                        {_.sumBy(monthBookings, 'co2Impact').toFixed(1)}kg
                      </div>
                      <div className="text-xs text-gray-500">
                        {monthBookings.length > 0 ?
                          `Avg: ${(_.sumBy(monthBookings, 'co2Impact') / monthBookings.length).toFixed(1)}kg per wash` :
                          'No data available'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sustainability Tips */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Tips for Sustainable Washing</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Use cold water when possible (saves up to 90% energy)</li>
            <li>• Wait for full loads (saves water and energy)</li>
            <li>• Choose eco-friendly programs</li>
            <li>• Avoid peak energy hours (typically 4-9 PM)</li>
          </ul>
        </div>
      </div>
    );
  };

  if (isLoading && userBookings.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        Loading bookings...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-4">
        Error loading bookings: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex space-x-2">
        <TabButton tab="current" label="Current" />
        <TabButton tab="history" label="History" />
        <TabButton tab="sustainability" label="Sustainability" />
      </div>

      {activeTab === 'current' && renderCurrentBookings()}
      {activeTab === 'history' && renderBookingHistory()}
      {activeTab === 'sustainability' && renderSustainabilityReport()}

      <ModifyDialog />
    </div>
  );
};


export default ManageBookings;