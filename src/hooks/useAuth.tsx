import { useBackendBase } from './useBackendBase';
import { authService } from '../backend/services';
import { User } from '../backend/types';

export const useAuth = () => {
  const { handleRequest, isLoading, error } = useBackendBase();

  return {
    isLoading,
    error,
    login: (username: string, password: string) => 
      handleRequest(() => authService.login(username, password)),
    updatePreferences: (userId: string, preferences: User['preferences']) =>
      handleRequest(() => authService.updatePreferences(userId, preferences))
  };
};