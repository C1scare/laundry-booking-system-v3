export interface User {
  id: string;
  username: string;
  password: string;
  bookingQuota: {
    daily: {
      limit: number;
      used: number;
    };
    weekly: {
      limit: number;
      used: number;
    };
  };
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
      machineAvailable: boolean;
      bookingReminder: boolean;
      washingComplete: boolean;
      machineError: boolean;
    };
    language: string;
  };
}

export interface Program {
  id: string;
  name: string;
  duration: number;
}

export interface Machine {
  id: string;
  name: string;
  status: 'available' | 'in-use' | 'maintenance' | 'error';
  lastUsed?: string;
  nextBooking?: string;
  timeRemaining?: number;
  error?: string;
}

export interface Booking {
  id: string;
  userId: string;
  machineId: string;
  date: string;
  startTime: string;
  duration: number;
  program: string;
  status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
  isFixedSlot: boolean;
  verificationCode: string; // 6-digit code for machine unlock
  waterUsage?: number;
  energyUsage?: number;
  co2Impact?: number;
}

export interface Report {
  id: string;
  type: 'machine' | 'user';
  reporterId: string;
  machineId?: string;
  reportedUserId?: string;
  issueType: string;
  description: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
}

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}