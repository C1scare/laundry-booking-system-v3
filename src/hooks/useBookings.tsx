import { useBackendBase } from './useBackendBase';
import { bookingService } from '../backend/services';
import { Booking } from '../backend/types';

type NewBooking = Omit<Booking, 'id'>;

export const useBookings = () => {
  const { handleRequest, isLoading, error } = useBackendBase();

    return {
    isLoading,
    error,
    checkAvailability: (machineId: string, date: string, startTime: string) =>
      handleRequest(() => bookingService.checkAvailability(machineId, date, startTime)),
    createBooking: (bookingData: Omit<Booking, 'id' | 'status' | 'verificationCode'>) => {
      const booking: Omit<Booking, 'id'> = {
        ...bookingData,
        status: 'upcoming',
        verificationCode: Math.random().toString(36).substr(2, 6).toUpperCase()
      };
      return handleRequest(() => bookingService.createBooking(booking));
    },
    modifyBooking: (bookingId: string, updates: Partial<Omit<Booking, 'id' | 'status' | 'verificationCode'>>) =>
      handleRequest(() => bookingService.modifyBooking(bookingId, updates)),
    cancelBooking: (bookingId: string) =>
      handleRequest(() => bookingService.cancelBooking(bookingId)),
    getUserBookings: (userId: string) =>
      handleRequest(() => bookingService.getUserBookings(userId))
  };
};