export interface CreateBookingDto {
  vehicleId: string;
  startDate: string | Date;
  endDate: string | Date;
  totalPrice?: number; // Artık backend'de hesaplanıyor
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  pickupLocation?: string;
  dropoffLocation?: string;
  notes?: string;
}

export interface UpdateBookingDto {
  startDate?: string | Date;
  endDate?: string | Date;
  totalPrice?: number;
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  pickupLocation?: string;
  dropoffLocation?: string;
  notes?: string;
}

export interface BookingResponseDto {
  id: string;
  userId: string;
  vehicleId: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  vehicle?: {
    id: string;
    brand: string;
    model: string;
    year: number;
    pricePerDay: number;
  };
} 