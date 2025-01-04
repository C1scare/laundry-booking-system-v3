import React, { useState } from 'react';
import LoginScreen from './auth/LoginScreen';
import Breadcrumbs from './navigation/Breadcrumbs';
import BookingForm from './booking/BookingForm';
import CurrentBookings from './booking/CurrentBookings';
import ManageBookings from './booking/ManageBookings';
import ReportInterface from './reporting/ReportInterface';
import MachineStatus from './status/MachineStatus';
import NotificationSettings from './settings/NotificationSettings';
import LanguageSettings from './settings/LanguageSettings';
import { bookingService } from '../backend/services';
import { NavButton } from './navigation/NavButton';
import { useAuth } from '../hooks/useAuth'
import { User } from '../backend/types';
import QuotaDisplay from './QuotaDisplay'; 
import { 
  Calendar, 
  WashingMachine, 
  Clock, 
  Bell, 
  Settings, 
  LogOut, 
  History, 
  LineChart, 
  AlertTriangle 
} from 'lucide-react';

type Page = 
  | 'login'
  | 'main'
  | 'booking'
  | 'manageBookings'
  | 'modifyTime'
  | 'modifyProgram'
  | 'modifySlotType'
  | 'cancelBooking'
  | 'bookingHistory'
  | 'sustainabilityReport'
  | 'machineStatus'
  | 'report'
  | 'reportMachine'
  | 'reportUser'
  | 'notificationSettings'
  | 'languageSettings';


export const LaundryBookingApp: React.FC = () => {
  // Add useEffect for periodic status updates
  React.useEffect(() => {
    // Update booking statuses immediately
    bookingService.updateAllBookingStatuses();

    // Set up interval to update booking statuses every minute
    const intervalId = setInterval(() => {
      bookingService.updateAllBookingStatuses();
    }, 60000); // 60000 ms = 1 minute

    // Cleanup on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const { login, updatePreferences, isLoading, error } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [user, setUser] = useState<User | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>(['Login']);

  // Auth handling
  const handleLogin = async (username: string, password: string) => {
    const loggedInUser = await login(username, password);
    console.log('Login response:', loggedInUser); // Debug log
    
    if (loggedInUser) {
      setUser(loggedInUser);
      setBreadcrumbs(['Home']);
      setCurrentPage('main');
    } else {
      throw new Error('Login failed');
    }
  };

  // Logout handler
  const handleLogout = () => {
    setUser(null);
    setCurrentPage('login');
    setBreadcrumbs(['Login']);
  };

  // Render logout button
  const LogoutButton = () => (
    <button
      onClick={handleLogout}
      className="fixed top-4 right-4 flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
    >
      <LogOut className="w-4 h-4" />
      <span>Logout</span>
    </button>
  );

  // Navigation handling
  const navigateTo = (page: Page, newBreadcrumb?: string) => {
    setCurrentPage(page);
    if (newBreadcrumb) {
      setBreadcrumbs(prev => [...prev, newBreadcrumb]);
    }
  };

  const handleBreadcrumbNavigation = (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    setCurrentPage(getPageFromBreadcrumb(newBreadcrumbs[index]));
  };

  const getPageFromBreadcrumb = (breadcrumb: string): Page => {
    const pageMap: { [key: string]: Page } = {
      'Login': 'login',
      'Home': 'main',
      'Book Machine': 'booking',
      'Manage Bookings': 'manageBookings',
      'Modify Time': 'modifyTime',
      'Modify Program': 'modifyProgram',
      'Modify Slot Type': 'modifySlotType',
      'Cancel Booking': 'cancelBooking',
      'Booking History': 'bookingHistory',
      'Sustainability Report': 'sustainabilityReport',
      'Machine Status': 'machineStatus',
      'Report Issue': 'report',
      'Report Machine Issue': 'reportMachine',
      'Report User Issue': 'reportUser',
      'Notification Settings': 'notificationSettings',
      'Language Settings': 'languageSettings'
    };
    return pageMap[breadcrumb] || 'main';
  };

  // Settings handling
  const handleNotificationSettingsUpdate = async (preferences: User['preferences']['notifications']) => {
    if (user) {
      const updatedUser = await updatePreferences(user.id, {
        ...user.preferences,
        notifications: preferences
      });

      if (updatedUser) {
        setUser(updatedUser);
      }
    }
  };

  const handleLanguageChange = async (languageCode: string) => {
    if (user) {
      const updatedUser = await updatePreferences(user.id, {
        ...user.preferences,
        language: languageCode
      });

      if (updatedUser) {
        setUser(updatedUser);
      }
    }
  };

  // Render main menu
  const renderMainMenu = () => (
    <div className="space-y-6">
      {/* Quota Display */}
      {user && (
        <QuotaDisplay userId={user.id} className="mb-8" />
      )}

      {/* Current Bookings Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Current Bookings</h2>
        <CurrentBookings userId={user?.id || ''} />
      </div>

      {/* Main Navigation */}
      <div className="space-y-4">
        <NavButton 
          icon={<Calendar className="w-5 h-5" />}
          text="Book Machine"
          onClick={() => navigateTo('booking', 'Book Machine')}
        />
        <NavButton 
          icon={<History className="w-5 h-5" />}
          text="Manage Bookings"
          onClick={() => navigateTo('manageBookings', 'Manage Bookings')}
        />
        <NavButton 
          icon={<WashingMachine className="w-5 h-5" />}
          text="Machine Status"
          onClick={() => navigateTo('machineStatus', 'Machine Status')}
        />
        <NavButton 
          icon={<AlertTriangle className="w-5 h-5" />}
          text="Report Issue"
          onClick={() => navigateTo('report', 'Report Issue')}
        />
        <NavButton 
          icon={<LineChart className="w-5 h-5" />}
          text="Sustainability Report"
          onClick={() => navigateTo('sustainabilityReport', 'Sustainability Report')}
        />
        <NavButton 
          icon={<Bell className="w-5 h-5" />}
          text="Notification Settings"
          onClick={() => navigateTo('notificationSettings', 'Notification Settings')}
        />
        <NavButton 
          icon={<Settings className="w-5 h-5" />}
          text="Language Settings"
          onClick={() => navigateTo('languageSettings', 'Language Settings')}
        />
      </div>
    </div>
  );

  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginScreen onLogin={handleLogin} />;
      
      case 'main':
        return renderMainMenu();
      
      case 'booking':
        return <BookingForm userId={user?.id || ''} />;
      
      case 'manageBookings':
      case 'modifyTime':
      case 'modifyProgram':
      case 'modifySlotType':
      case 'cancelBooking':
      case 'bookingHistory':
      case 'sustainabilityReport':
        return (
          <ManageBookings 
            userId={user?.id || ''}
            selectedAction={currentPage}
            initialTab={currentPage === 'sustainabilityReport' ? 'sustainability' : 'current'}
          />
        );
      
      case 'report':
        return (
          <div className="space-y-4">
            <NavButton 
              icon={<WashingMachine className="w-5 h-5" />}
              text="Report Machine Issue"
              onClick={() => navigateTo('reportMachine', 'Report Machine Issue')}
            />
            <NavButton 
              icon={<AlertTriangle className="w-5 h-5" />}
              text="Report User Issue"
              onClick={() => navigateTo('reportUser', 'Report User Issue')}
            />
          </div>
        );

      case 'reportMachine':
      case 'reportUser':
        return (
          <ReportInterface 
            userId={user?.id || ''}
            initialType={currentPage === 'reportMachine' ? 'machine' : 'user'} 
          />
        );
      
      case 'machineStatus':
        return <MachineStatus />;
      
      case 'notificationSettings':
        return (
          <NotificationSettings
            initialPreferences={user?.preferences.notifications}
            onSave={handleNotificationSettingsUpdate}
          />
        );
      
      case 'languageSettings':
        return (
          <LanguageSettings
            currentLanguage={user?.preferences.language || 'en'}
            onLanguageChange={handleLanguageChange}
          />
        );
      
      default:
        return (
          <div className="text-center text-gray-500 py-4">
            Page under construction
          </div>
        );
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-gray-100 min-h-screen relative">
      {currentPage !== 'login' && <LogoutButton />}
      
      {currentPage !== 'login' && (
        <div className="mb-6 pt-12">
          <div className="text-2xl font-bold mb-2">Laundry Booking System</div>
          <Breadcrumbs
            items={breadcrumbs}
            onNavigate={handleBreadcrumbNavigation}
          />
        </div>
      )}

      <div className="bg-white rounded-lg p-4 shadow">
        {renderPage()}
      </div>

      {currentPage !== 'login' && currentPage !== 'main' && (
        <button
          onClick={() => {
            setBreadcrumbs(prev => prev.slice(0, -1));
            setCurrentPage(getPageFromBreadcrumb(breadcrumbs[breadcrumbs.length - 2]));
          }}
          className="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Back
        </button>
      )}
    </div>
  );
};

export default LaundryBookingApp;


