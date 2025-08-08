export interface CreatePaymentDto {
  userId: string;
  bookingId: string;
  amount: number;
  currency?: string;
  paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'CASH';
  status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  stripePaymentIntentId?: string;
  description?: string;
}

export interface UpdatePaymentDto {
  status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  stripePaymentIntentId?: string;
  description?: string;
}

export interface PaymentResponseDto {
  id: string;
  userId: string;
  bookingId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  stripePaymentIntentId?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  booking?: {
    id: string;
    startDate: Date;
    endDate: Date;
    totalPrice: number;
    status: string;
    vehicle?: {
      id: string;
      brand: string;
      model: string;
      year: number;
    };
  };
} 