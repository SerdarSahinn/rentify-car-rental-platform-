import api from './api';

export interface PaymentIntentResponse {
  clientSecret: string;
}

export interface PaymentConfirmationResponse {
  success: boolean;
  message: string;
}

export const createPaymentIntent = async (bookingId: string): Promise<{ data: PaymentIntentResponse }> => {
  const response = await api.post(`/payments/create-intent`, { bookingId });
  return response.data;
};

export const confirmPayment = async (paymentIntentId: string, bookingId: string): Promise<{ data: PaymentConfirmationResponse }> => {
  const response = await api.post(`/payments/confirm`, { paymentIntentId, bookingId });
  return response.data;
}; 