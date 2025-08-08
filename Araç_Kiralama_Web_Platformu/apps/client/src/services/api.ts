import axios from 'axios';
import type { Vehicle, User, Review, ApiResponse, VehicleFilters } from '../types/index.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(async (config) => {
  try {
    // Get token from Clerk
    const token = await window.Clerk?.session?.getToken();
    console.log('🔍 Token alındı:', token ? 'Var' : 'Yok');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔍 Authorization header eklendi');
    } else {
      console.log('🔍 Token yok, header eklenmedi');
    }
  } catch (error) {
    console.error('Token alınamadı:', error);
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Vehicle API
export const vehicleApi = {
  // Get all vehicles with filters
  getVehicles: (filters?: VehicleFilters): Promise<ApiResponse<Vehicle[]>> =>
    api.get('/vehicles', { params: filters }).then(res => res.data),

  // Get featured vehicles
  getFeaturedVehicles: (): Promise<ApiResponse<Vehicle[]>> =>
    api.get('/vehicles/featured').then(res => res.data),

  // Get vehicle categories
  getCategories: (): Promise<ApiResponse<string[]>> =>
    api.get('/vehicles/categories').then(res => res.data),

  // Get single vehicle
  getVehicle: (id: string): Promise<ApiResponse<Vehicle>> =>
    api.get(`/vehicles/${id}`).then(res => res.data),

  // Get single vehicle by ID (alias)
  getVehicleById: (id: string): Promise<ApiResponse<Vehicle>> =>
    api.get(`/vehicles/${id}`).then(res => res.data),

  // Get vehicle reviews
  getVehicleReviews: (id: string): Promise<ApiResponse<Review[]>> =>
    api.get(`/vehicles/${id}/reviews`).then(res => res.data),

  // Create vehicle (Admin only)
  createVehicle: (data: Partial<Vehicle>): Promise<ApiResponse<Vehicle>> =>
    api.post('/vehicles', data).then(res => res.data),

  // Update vehicle (Admin only)
  updateVehicle: (id: string, data: Partial<Vehicle>): Promise<ApiResponse<Vehicle>> =>
    api.put(`/vehicles/${id}`, data).then(res => res.data),

  // Delete vehicle (Admin only)
  deleteVehicle: (id: string): Promise<ApiResponse<{ message: string }>> =>
    api.delete(`/vehicles/${id}`).then(res => res.data),
};

// Auth API
export const authApi = {
  // Get user profile
  getProfile: (): Promise<ApiResponse<User>> =>
    api.get('/auth/profile').then(res => res.data),

  // Update user profile
  updateProfile: (data: Partial<User>): Promise<ApiResponse<User>> =>
    api.put('/auth/profile', data).then(res => res.data),

  // Get user stats
  getStats: (): Promise<ApiResponse<{ totalBookings: number; totalReviews: number; totalFavorites: number }>> =>
    api.get('/auth/stats').then(res => res.data),
};

// Health check
export const healthApi = {
  check: (): Promise<{ status: string; timestamp: string; environment: string }> =>
    axios.get(`${API_BASE_URL.replace('/api', '')}/health`).then(res => res.data),
};

export default api; 