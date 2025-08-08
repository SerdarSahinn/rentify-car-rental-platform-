import type { ApiResponse, Booking } from '../types';
import api from './api';

// Kiralama oluştur
export const createBooking = async (bookingData: {
  vehicleId: string;
  startDate: string;
  endDate: string;
  notes?: string;
  userEmail?: string;
}): Promise<Booking> => {
  const response = await api.post('/bookings', bookingData);
  return response.data;
};

// Kullanıcının kiralamalarını getir
export const getUserBookings = async (): Promise<ApiResponse<Booking[]>> => {
  const response = await api.get('/bookings/user');
  return response.data;
};

// Kiralama detayını getir
export const getBookingById = async (id: string): Promise<ApiResponse<Booking>> => {
  const response = await api.get(`/bookings/${id}`);
  return response.data;
};

// Kiralama iptal et
export const cancelBooking = async (id: string): Promise<ApiResponse<Booking>> => {
  const response = await api.patch(`/bookings/${id}/cancel`);
  return response.data;
};

// Admin: Tüm kiralamaları getir
export const getAllBookings = async (): Promise<ApiResponse<Booking[]>> => {
  const response = await api.get('/bookings');
  return response.data;
};

// Admin: Kiralama durumunu güncelle
export const updateBookingStatus = async (
  id: string, 
  status: string
): Promise<ApiResponse<Booking>> => {
  const response = await api.patch(`/bookings/${id}/status`, { status });
  return response.data;
}; 