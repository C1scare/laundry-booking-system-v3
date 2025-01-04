import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: number) => void;
  className?: string;
}

export const BookingCalendar: React.FC<CalendarProps> = ({ 
  selectedDate: initialDate,
  onDateSelect,
  className = ''
}) => {
  const [currentDate, setCurrentDate] = useState(initialDate);

  const getDaysInMonth = (date: Date): number => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={handlePreviousMonth}
          disabled={currentDate.getMonth() === new Date().getMonth() && 
                   currentDate.getFullYear() === new Date().getFullYear()}
          className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button 
          onClick={handleNextMonth}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-medium p-2 text-sm">
            {day}
          </div>
        ))}
        {[...Array(firstDay)].map((_, i) => (
          <div key={`empty-${i}`} className="p-2" />
        ))}
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const currentDate = new Date();
          const isToday = day === initialDate.getDate() && 
                       currentDate.getMonth() === initialDate.getMonth() &&
                       currentDate.getFullYear() === initialDate.getFullYear();
          
          const isPastDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate()
          ) > new Date(
            initialDate.getFullYear(),
            initialDate.getMonth(),
            day
          );

          return (
            <button
              key={day}
              onClick={() => !isPastDate && onDateSelect(day)}
              disabled={isPastDate}
              className={`p-2 text-center rounded transition-colors
                ${isToday ? 'bg-blue-100 hover:bg-blue-200' : ''}
                ${isPastDate 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'hover:bg-gray-100'
                }
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BookingCalendar;