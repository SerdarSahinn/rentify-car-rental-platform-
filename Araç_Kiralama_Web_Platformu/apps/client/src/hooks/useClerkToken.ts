import { useAuth } from '@clerk/clerk-react';
import { useCallback } from 'react';

export const useClerkToken = () => {
  const { getToken } = useAuth();

  const getAuthToken = useCallback(async (): Promise<string | null> => {
    try {
      const token = await getToken();
      return token;
    } catch (error) {
      console.error('Token alınamadı:', error);
      return null;
    }
  }, [getToken]);

  return { getAuthToken };
}; 