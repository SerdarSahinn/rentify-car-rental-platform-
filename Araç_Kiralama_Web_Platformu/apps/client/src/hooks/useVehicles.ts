import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  fuelType: string;
  transmission: string;
  category: string;
  seats: number;
  dailyPrice: number;
  weeklyPrice?: number;
  monthlyPrice?: number;
  description: string;
  features: string[];
  images: string[];
  location: string;
  latitude?: number;
  longitude?: number;
  isAvailable: boolean;
  isFeatured: boolean;
  averageRating: number;
  totalReviews: number;
  totalBookings: number;
  createdAt: string;
}

interface CreateVehicleData {
  brand: string;
  model: string;
  year: number;
  fuelType: string;
  transmission: string;
  category: string;
  seats: number;
  dailyPrice: number;
  weeklyPrice?: number;
  monthlyPrice?: number;
  description: string;
  features: string[];
  images: string[];
  location: string;
  latitude?: number;
  longitude?: number;
  isAvailable?: boolean;
  isFeatured?: boolean;
}

// Auth token alıcı fonksiyon
const getAuthHeaders = async (getToken: () => Promise<string | null>) => {
  const token = await getToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Public: Tüm araçları getir (kullanıcılar için)
export const useVehicles = (
  page = 1, 
  limit = 12, 
  search = '', 
  category = 'all',
  minPrice?: number,
  maxPrice?: number,
  fuelType = 'all',
  transmission = 'all'
) => {
  return useQuery({
    queryKey: ['vehicles', page, limit, search, category, minPrice, maxPrice, fuelType, transmission],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(category !== 'all' && { category }),
        ...(minPrice && { minPrice: minPrice.toString() }),
        ...(maxPrice && { maxPrice: maxPrice.toString() }),
        ...(fuelType !== 'all' && { fuelType }),
        ...(transmission !== 'all' && { transmission }),
      });

      const response = await axios.get(`${API_URL}/api/vehicles?${params}`);
      return response.data;
    },
  });
};

// Public: Tekil araç getir
export const useVehicle = (id: string) => {
  return useQuery({
    queryKey: ['vehicle', id],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/vehicles/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Admin: Tüm araçları getir (admin paneli için)
export const useAdminVehicles = (page = 1, limit = 20, search = '', category = 'all') => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['admin-vehicles', page, limit, search, category],
    queryFn: async () => {
      const headers = await getAuthHeaders(getToken);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(category !== 'all' && { category }),
      });

      const response = await axios.get(
        `${API_URL}/api/vehicles/admin/list?${params}`,
        { headers }
      );
      return response.data;
    },
    enabled: !!getToken,
  });
};

// Admin: Yeni araç ekle
export const useCreateVehicle = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vehicleData: CreateVehicleData) => {
      const headers = await getAuthHeaders(getToken);
      const response = await axios.post(
        `${API_URL}/api/vehicles`,
        vehicleData,
        { headers }
      );
      return response.data;
    },
    onSuccess: () => {
      // Tüm araç listelerini yenile
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-vehicles'] });
    },
  });
};

// Admin: Araç güncelle
export const useUpdateVehicle = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateVehicleData> }) => {
      const headers = await getAuthHeaders(getToken);
      const response = await axios.put(
        `${API_URL}/api/vehicles/${id}`,
        data,
        { headers }
      );
      return response.data;
    },
    onSuccess: () => {
      // Tüm araç listelerini yenile
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-vehicles'] });
    },
  });
};

// Admin: Araç sil
export const useDeleteVehicle = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const headers = await getAuthHeaders(getToken);
      const response = await axios.delete(
        `${API_URL}/api/vehicles/${id}`,
        { headers }
      );
      return response.data;
    },
    onSuccess: () => {
      // Tüm araç listelerini yenile
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-vehicles'] });
    },
  });
};

// Admin: Araç durumunu değiştir (müsait/kiralık)
export const useToggleVehicleStatus = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const headers = await getAuthHeaders(getToken);
      const response = await axios.patch(
        `${API_URL}/api/vehicles/${id}/toggle-status`,
        {},
        { headers }
      );
      return response.data;
    },
    onSuccess: () => {
      // Tüm araç listelerini yenile
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-vehicles'] });
    },
  });
};

export type { Vehicle, CreateVehicleData };
