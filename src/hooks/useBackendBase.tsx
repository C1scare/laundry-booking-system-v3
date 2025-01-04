import { useState } from 'react';
import { ServiceResponse } from '../backend/types';

export const useBackendBase = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequest = async <T,>(requestPromise: () => Promise<ServiceResponse<T>>) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await requestPromise();
      if (!response.success) {
        setError(response.error || 'An error occurred');
        return null;
      }
      return response.data ?? null;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    handleRequest
  };
};