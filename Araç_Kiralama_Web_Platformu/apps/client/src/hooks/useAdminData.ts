import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  totalBookings: number;
  lastLogin: string;
}

interface Booking {
  id: string;
  bookingNumber: string;
  user: {
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  vehicle: {
    brand: string;
    model: string;
    year: number;
    image: string;
    pricePerDay: number;
  };
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  paymentMethod?: string;
  pickupLocation?: string;
  notes?: string;
  createdAt: string;
}

interface DashboardStats {
  users: {
    total: number;
    active: number;
    growth: number;
  };
  bookings: {
    total: number;
    pending: number;
    confirmed: number;
    growth: number;
  };
  vehicles: {
    total: number;
    available: number;
  };
  revenue: {
    total: number;
    monthly: number;
    growth: number;
  };
}

// Auth token alıcı fonksiyon
const getAuthHeaders = async (getToken: () => Promise<string | null>) => {
  const token = await getToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Admin kullanıcıları getir
export const useAdminUsers = (page = 1, limit = 50, search = '', role = 'all') => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['admin-users', page, limit, search, role],
    queryFn: async () => {
      const headers = await getAuthHeaders(getToken);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(role !== 'all' && { role }),
      });

      const response = await axios.get(
        `${API_URL}/api/admin/users?${params}`,
        { headers }
      );
      return response.data;
    },
    enabled: !!getToken,
  });
};

// Admin rezervasyonları getir
export const useAdminBookings = (page = 1, limit = 50, search = '', status = 'all') => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['admin-bookings', page, limit, search, status],
    queryFn: async () => {
      const headers = await getAuthHeaders(getToken);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(status !== 'all' && { status }),
      });

      const response = await axios.get(
        `${API_URL}/api/admin/bookings?${params}`,
        { headers }
      );
      return response.data;
    },
    enabled: !!getToken,
  });
};

// Dashboard istatistikleri getir
export const useAdminDashboardStats = () => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const headers = await getAuthHeaders(getToken);
      const response = await axios.get(
        `${API_URL}/api/admin/dashboard/stats`,
        { headers }
      );
      return response.data;
    },
    enabled: !!getToken,
  });
};

// Rezervasyon durumu güncelle
export const useUpdateBookingStatus = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      const headers = await getAuthHeaders(getToken);
      const response = await axios.patch(
        `${API_URL}/api/admin/bookings/${bookingId}/status`,
        { status },
        { headers }
      );
      return response.data;
    },
    onSuccess: () => {
      // Rezervasyon listesini yenile
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
    },
  });
};

export type { User, Booking, DashboardStats };
