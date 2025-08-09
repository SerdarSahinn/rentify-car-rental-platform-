import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface UploadedImage {
  filename: string;
  originalName: string;
  size: number;
  url: string;
  fullUrl: string;
}

// Auth token alıcı fonksiyon
const getAuthHeaders = async (getToken: () => Promise<string | null>) => {
  const token = await getToken();
  return {
    'Authorization': `Bearer ${token}`,
  };
};

// Tek resim yükleme
export const useUploadSingleImage = () => {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (file: File) => {
      const headers = await getAuthHeaders(getToken);
      
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(
        `${API_URL}/api/uploads/single`,
        formData,
        { 
          headers: {
            ...headers,
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      
      return response.data;
    },
  });
};

// Çoklu resim yükleme
export const useUploadMultipleImages = () => {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (files: File[]) => {
      const headers = await getAuthHeaders(getToken);
      
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append('images', file);
      });

      const response = await axios.post(
        `${API_URL}/api/uploads/multiple`,
        formData,
        { 
          headers: {
            ...headers,
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      
      return response.data;
    },
  });
};

export type { UploadedImage };
