import { storage } from './storage';
import { User, Booking, Machine, Report, ServiceResponse } from './types';
import { PROGRAMS } from '../components/constants/programs';
import { v4 as uuidv4 } from 'uuid';

export const authService = {
  login: async (username: string, password: string): Promise<ServiceResponse<User>> => {
    console.log('Login attempt:', { username }); // Debug log
    
    const user = storage.getUserByUsername(username);
    console.log('Found user:', user); // Debug log
    
    if (!user || user.password !== password) {
      console.log('Login failed:', { user, password }); // Debug log
      return { 
        success: false, 
        error: 'Invalid username or password' 
      };
    }

    return { 
      success: true, 
      data: user 
    };
  },

  updatePreferences: async (userId: string, preferences: User['preferences']): Promise<ServiceResponse<User>> => {
    const user = storage.getUserById(userId);
    if (!user) {
      return { 
        success: false, 
        error: 'User not found' 
      };
    }

    const updatedUser = {
      ...user,
      preferences
    };

    storage.updateUser(updatedUser);
    return { 
      success: true, 
      data: updatedUser 
    };
  }
};

// Helper function to generate verification code
const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


// Helper function to evaluate booking status based on current time
const evaluateBookingStatus = (booking: Booking): Booking['status'] => {
  const now = new Date();
  const bookingDate = new Date(booking.date);
  const [hours, minutes] = booking.startTime.split(':').map(Number);
  bookingDate.setHours(hours, minutes);

  const endDate = new Date(bookingDate);
  endDate.setMinutes(endDate.getMinutes() + booking.duration);

  if (booking.status === 'cancelled') {
    return 'cancelled';
  }

  if (now < bookingDate) {
    return 'upcoming';
  }

  if (now >= bookingDate && now < endDate) {
    return 'in-progress';
  }

  return 'completed';
};


const getCurrentWeekBookings = (userId: string): Booking[] => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  return storage.getBookingsByUserId(userId).filter(booking => {
    const bookingDate = new Date(booking.date);
    return bookingDate >= startOfWeek && 
           bookingDate < endOfWeek && 
           booking.status !== 'cancelled';
  });
};


export const bookingService = {
  checkAvailability: async (machineId: string, date: string, startTime: string): Promise<ServiceResponse<boolean>> => {
    const existingBookings = storage.getBookingsByMachineId(machineId)
      .filter(b => b.date === date && b.startTime === startTime && b.status !== 'cancelled');
    
    return { success: true, data: existingBookings.length === 0 };
  },

    createBooking: async (booking: Omit<Booking, 'id' | 'verificationCode'>): Promise<ServiceResponse<Booking>> => {
      const machine = storage.getMachineById(booking.machineId);
      if (!machine) {
        return { success: false, error: 'Machine not found' };
      }
  
      // Check quota
      const user = storage.getUserById(booking.userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }
  
      const dailyBookingsCount = storage.getBookingsByUserAndDate(user.id, booking.date).length;
      if (dailyBookingsCount >= user.bookingQuota.daily.limit) {
        return { success: false, error: 'Daily booking quota exceeded for this date' };
      }
  
      // Check weekly quota using actual week bookings
    const weeklyBookings = getCurrentWeekBookings(user.id);
    if (weeklyBookings.length >= user.bookingQuota.weekly.limit) {
      return { success: false, error: 'Weekly booking quota exceeded' };
    }
  
      // Check availability
      const isAvailable = await bookingService.checkAvailability(
        booking.machineId,
        booking.date,
        booking.startTime
      );
  
      if (!isAvailable.success || !isAvailable.data) {
        return { success: false, error: 'Time slot not available' };
      }
  
      // Add environmental data from program
      const program = PROGRAMS.find(p => p.name === booking.program);
      if (!program) {
        return { success: false, error: 'Invalid program selected' };
      }

      const newBooking: Booking = {
        ...booking,
        id: uuidv4(),
        status: 'upcoming' as const,
        verificationCode: generateVerificationCode(),
        waterUsage: program.waterUsage,
        energyUsage: program.energyUsage,
        co2Impact: program.co2Impact
      };
  
      storage.addBooking(newBooking);
  
      // Update quotas
      //user.bookingQuota.daily.used++;
      //user.bookingQuota.weekly.used++;
      storage.updateUser(user);
  
      return { success: true, data: newBooking };
    },

  modifyBooking: async (bookingId: string, updates: Partial<Booking>): Promise<ServiceResponse<Booking>> => {
    const booking = storage.getBookingById(bookingId);
    if (!booking) {
      return { success: false, error: 'Booking not found' };
    }

    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return { success: false, error: 'Cannot modify completed or cancelled booking' };
    }

    // If changing time or date, check availability
    if (updates.date || updates.startTime) {
      const isAvailable = await bookingService.checkAvailability(
        booking.machineId,
        updates.date || booking.date,
        updates.startTime || booking.startTime
      );

      if (!isAvailable.success || !isAvailable.data) {
        return { success: false, error: 'Selected time slot is not available' };
      }
    }

    const updatedBooking: Booking = {
      ...booking,
      ...updates,
      // Preserve the original verification code and status
      verificationCode: booking.verificationCode,
      status: booking.status
    };
    
    storage.updateBooking(updatedBooking);

    return { success: true, data: updatedBooking };
  },

  cancelBooking: async (bookingId: string): Promise<ServiceResponse<Booking>> => {
    const booking = storage.getBookingById(bookingId);
    if (!booking) {
      return { success: false, error: 'Booking not found' };
    }

    if (booking.status !== 'upcoming') {
      return { success: false, error: 'Can only cancel upcoming bookings' };
    }

    const updatedBooking: Booking = {
      ...booking,
      status: 'cancelled' as const
    };
    
    storage.updateBooking(updatedBooking);

    // Refund quota
    const user = storage.getUserById(booking.userId);
    if (user) {
      user.bookingQuota.daily.used = Math.max(0, user.bookingQuota.daily.used - 1);
      user.bookingQuota.weekly.used = Math.max(0, user.bookingQuota.weekly.used - 1);
      storage.updateUser(user);
    }

    return { success: true, data: updatedBooking };
  },

  getUserBookings: async (userId: string): Promise<ServiceResponse<Booking[]>> => {
    const bookings = storage.getBookingsByUserId(userId);
    
    // Update status of all bookings based on current time
    const updatedBookings = bookings.map(booking => {
      const newStatus = evaluateBookingStatus(booking);
      if (newStatus !== booking.status) {
        const updatedBooking = { ...booking, status: newStatus };
        storage.updateBooking(updatedBooking);
        return updatedBooking;
      }
      return booking;
    });

    return { success: true, data: updatedBookings };
  },

  updateAllBookingStatuses: async (): Promise<ServiceResponse<void>> => {
    try {
      const allBookings = storage.getBookings();
      allBookings.forEach(booking => {
        const newStatus = evaluateBookingStatus(booking);
        if (newStatus !== booking.status) {
          storage.updateBooking({ ...booking, status: newStatus });
        }
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to update booking statuses' };
    }
  }
};

export const machineService = {
  getAllMachines: async (): Promise<ServiceResponse<Machine[]>> => {
    const machines = storage.getMachines();
    return { success: true, data: machines };
  },

  getMachineStatus: async (machineId: string): Promise<ServiceResponse<Machine>> => {
    const machine = storage.getMachineById(machineId);
    if (!machine) {
      return { success: false, error: 'Machine not found' };
    }
    return { success: true, data: machine };
  },

  updateMachineStatus: async (machineId: string, status: Machine['status'], error?: string): Promise<ServiceResponse<Machine>> => {
    const machine = storage.getMachineById(machineId);
    if (!machine) {
      return { success: false, error: 'Machine not found' };
    }

    const updatedMachine = { ...machine, status, error };
    storage.updateMachine(updatedMachine);
    return { success: true, data: updatedMachine };
  }
};

export const reportService = {
  createReport: async (report: Omit<Report, 'id' | 'status' | 'createdAt'>): Promise<ServiceResponse<Report>> => {
    const newReport: Report = {
      ...report,
      id: uuidv4(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    storage.addReport(newReport);
    return { success: true, data: newReport };
  },

  getUserReports: async (userId: string): Promise<ServiceResponse<Report[]>> => {
    const reports = storage.getReportsByReporterId(userId);
    return { success: true, data: reports };
  },

  getMachineReports: async (machineId: string): Promise<ServiceResponse<Report[]>> => {
    const reports = storage.getReportsByMachineId(machineId);
    return { success: true, data: reports };
  }
};