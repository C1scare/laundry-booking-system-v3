import React, { useState } from 'react';
import { User, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface LoginScreenProps {
  onLogin: (username: string, password: string) => Promise<void>;
  className?: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  className = ''
}) => {
  const { login, isLoading: isAuthLoading, error: authError } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(username, password);
      if (result) {
        // Only call onLogin if authentication was successful
        await onLogin(username, password);
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Use either local error or auth error
  const displayError = error || authError;
  const isDisabled = isLoading || isAuthLoading;

  return (
    <div className={`max-w-md mx-auto space-y-6 ${className}`}>
      <div className="text-center">
        <h1 className="text-2xl font-bold">Welcome to LaundryBook</h1>
        <p className="text-gray-500 mt-2">Please login to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {displayError && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>{displayError}</span>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="username" className="block text-sm font-medium">
            Username
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your username"
              required
              disabled={isDisabled}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
              required
              disabled={isDisabled}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="rounded border-gray-300" />
            <span className="text-sm">Remember me</span>
          </label>
          <button type="button" className="text-sm text-blue-600 hover:text-blue-800">
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={isDisabled}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 
                   transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {isDisabled ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="text-center text-sm text-gray-500">
        Don't have an account?{' '}
        <button className="text-blue-600 hover:text-blue-800">
          Contact building management
        </button>
      </div>

      {/* Debug information in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm">
          <p>Debug Info:</p>
          <p>Username: user1</p>
          <p>Password: password123</p>
        </div>
      )}
    </div>
  );
};

export default LoginScreen;