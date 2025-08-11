// Vehicle types
export interface Vehicle {
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
  features: string; // JSON string
  images: string; // JSON string
  location: string;
  latitude?: number;
  longitude?: number;
  isAvailable: boolean;
  isFeatured: boolean;
  averageRating: number;
  totalReviews: number;
  totalBookings: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    reviews: number;
    bookings: number;
  };
}

// User types
export interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    bookings: number;
    reviews: number;
    favorites: number;
  };
}



// Booking types
export interface Booking {
  id: string;
  userId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  stripePaymentId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  vehicle?: Vehicle;
  user?: User;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Filter types
export interface VehicleFilters {
  page?: number;
  limit?: number;
  category?: string;
  fuelType?: string;
  transmission?: string;
  minPrice?: number;
  maxPrice?: number;
  isAvailable?: boolean;
  isFeatured?: boolean;
  search?: string;
}

// Clerk Types
declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken(): Promise<string | null>;
      };
    };
  }
} 