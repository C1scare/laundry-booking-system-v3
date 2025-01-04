import { User, Booking, Machine, Report } from './types';
import rawUsers from './data/users.json';
import rawMachines from './data/machines.json';
import rawBookings from './data/bookings.json';
import rawReports from './data/reports.json';


// Interface for raw booking data
interface RawBooking {
  id: string;
  userId: string;
  machineId: string;
  date: string;
  startTime: string;
  duration: number;
  program: string;
  status: string;
  isFixedSlot: boolean;
  waterUsage: number;
  energyUsage: number;
  co2Impact: number;
}

// Type guard functions
const isMachineStatus = (status: string): status is Machine['status'] =>
  ['available', 'in-use', 'maintenance', 'error'].includes(status);

const isBookingStatus = (status: string): status is Booking['status'] =>
  ['upcoming', 'in-progress', 'completed', 'cancelled'].includes(status);

const isReportType = (type: string): type is Report['type'] =>
  ['machine', 'user'].includes(type);

const isReportStatus = (status: string): status is Report['status'] =>
  ['pending', 'in-progress', 'resolved'].includes(status);

const parseInitialData = () => {
  // Parse machines with type checking
  const initialMachines: Machine[] = rawMachines.map(machine => ({
    ...machine,
    status: isMachineStatus(machine.status) ? machine.status : 'maintenance'
  }));

  // Parse bookings with type checking and add verification codes
  const initialBookings: Booking[] = (rawBookings as RawBooking[]).map(booking => ({
    ...booking,
    status: isBookingStatus(booking.status) ? booking.status : 'upcoming',
    verificationCode: Math.random().toString(36).substr(2, 6).toUpperCase()
  }));

  // Parse reports with type checking
  const initialReports: Report[] = rawReports.map(report => ({
    ...report,
    type: isReportType(report.type) ? report.type : 'machine',
    status: isReportStatus(report.status) ? report.status : 'pending',
    urgency: ['low', 'medium', 'high'].includes(report.urgency) ? 
      report.urgency as 'low' | 'medium' | 'high' : 'medium'
  }));

  return {
    initialUsers: rawUsers as User[],
    initialMachines,
    initialBookings,
    initialReports
  };
};


class Storage {
  private data = parseInitialData();
  private users: User[] = this.data.initialUsers;
  private machines: Machine[] = this.data.initialMachines;
  private bookings: Booking[] = this.data.initialBookings;
  private reports: Report[] = this.data.initialReports;

  constructor() {
    this.loadFromLocalStorage();
  }

  private saveToLocalStorage() {
    try {
      localStorage.setItem('laundryApp_users', JSON.stringify(this.users));
      localStorage.setItem('laundryApp_bookings', JSON.stringify(this.bookings));
      localStorage.setItem('laundryApp_machines', JSON.stringify(this.machines));
      localStorage.setItem('laundryApp_reports', JSON.stringify(this.reports));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  private loadFromLocalStorage() {
    try {
      const usersData = localStorage.getItem('laundryApp_users');
      const bookingsData = localStorage.getItem('laundryApp_bookings');
      const machinesData = localStorage.getItem('laundryApp_machines');
      const reportsData = localStorage.getItem('laundryApp_reports');

      if (usersData) this.users = JSON.parse(usersData);
      if (machinesData) {
        const machines = JSON.parse(machinesData);
        this.machines = machines.map((m: any) => ({
          ...m,
          status: isMachineStatus(m.status) ? m.status : 'maintenance'
        }));
      }
      if (bookingsData) {
        const bookings = JSON.parse(bookingsData);
        this.bookings = bookings.map((b: any) => ({
          ...b,
          status: isBookingStatus(b.status) ? b.status : 'upcoming',
          verificationCode: b.verificationCode || Math.random().toString(36).substr(2, 6).toUpperCase()
        }));
      }
      if (reportsData) {
        const reports = JSON.parse(reportsData);
        this.reports = reports.map((r: any) => ({
          ...r,
          type: isReportType(r.type) ? r.type : 'machine',
          status: isReportStatus(r.status) ? r.status : 'pending'
        }));
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      this.resetToInitial();
    }
  }

  // Users
  getUsers = () => this.users;
  getUserById = (id: string) => this.users.find(u => u.id === id);
  getUserByUsername = (username: string) => this.users.find(u => u.username === username);
  updateUser = (user: User) => {
    const index = this.users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      this.users[index] = user;
      this.saveToLocalStorage();
    }
  };

  // Bookings
  getBookings = () => this.bookings;
  getBookingById = (id: string) => this.bookings.find(b => b.id === id);
  getBookingsByUserId = (userId: string) => this.bookings.filter(b => b.userId === userId);
  getBookingsByMachineId = (machineId: string) => this.bookings.filter(b => b.machineId === machineId);
  addBooking = (booking: Booking) => {
    this.bookings.push(booking);
    this.saveToLocalStorage();
  };
  updateBooking = (booking: Booking) => {
    const index = this.bookings.findIndex(b => b.id === booking.id);
    if (index >= 0) {
      this.bookings[index] = booking;
      this.saveToLocalStorage();
    }
  };
  deleteBooking = (id: string) => {
    this.bookings = this.bookings.filter(b => b.id !== id);
    this.saveToLocalStorage();
  };

  // Machines
  getMachines = () => this.machines;
  getMachineById = (id: string) => this.machines.find(m => m.id === id);
  getAvailableMachines = () => this.machines.filter(m => m.status === 'available');
  updateMachine = (machine: Machine) => {
    const index = this.machines.findIndex(m => m.id === machine.id);
    if (index >= 0) {
      this.machines[index] = machine;
      this.saveToLocalStorage();
    }
  };

  // Reports
  getReports = () => this.reports;
  getReportById = (id: string) => this.reports.find(r => r.id === id);
  getReportsByMachineId = (machineId: string) => this.reports.filter(r => r.machineId === machineId);
  getReportsByReporterId = (reporterId: string) => this.reports.filter(r => r.reporterId === reporterId);
  addReport = (report: Report) => {
    this.reports.push(report);
    this.saveToLocalStorage();
  };
  updateReport = (report: Report) => {
    const index = this.reports.findIndex(r => r.id === report.id);
    if (index >= 0) {
      this.reports[index] = report;
      this.saveToLocalStorage();
    }
  };

  // Reset to initial data
  resetToInitial = () => {
    this.users = this.data.initialUsers;
    this.machines = this.data.initialMachines;
    this.bookings = this.data.initialBookings;
    this.reports = this.data.initialReports;
    this.saveToLocalStorage();
  };

  // In storage.ts, add this new method to the Storage class
  getBookingsByUserAndDate = (userId: string, date: string) => 
    this.bookings.filter(b => 
      b.userId === userId && 
      b.date === date && 
      b.status !== 'cancelled'
    );
}

export const storage = new Storage();