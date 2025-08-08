import { PrismaClient } from '@prisma/client';
import { CreatePaymentDto } from './dto';

const prisma = new PrismaClient();

export class PaymentService {
  // Ödeme oluştur
  async createPayment(paymentData: CreatePaymentDto) {
    // Geçici olarak devre dışı
    return { id: 'temp', ...paymentData };
  }

  // ID'ye göre ödeme getir
  async getPaymentById(id: string) {
    // Geçici olarak devre dışı
    return null;
  }

  // Kullanıcının ödemelerini getir
  async getUserPayments(userId: string) {
    // Geçici olarak devre dışı
    return [];
  }

  // Ödeme durumunu güncelle
  async updatePaymentStatus(id: string, status: string) {
    // Geçici olarak devre dışı
    return { id, status };
  }

  // Stripe webhook işleme
  async handleStripeWebhook(req: any) {
    // Geçici olarak devre dışı
    return { success: true, message: 'Webhook işlendi' };
  }

  // Ödeme iptal et
  async cancelPayment(id: string) {
    // Geçici olarak devre dışı
    return { id, status: 'CANCELLED' };
  }

  // Booking ID'ye göre ödeme getir
  async getPaymentByBookingId(bookingId: string) {
    // Geçici olarak devre dışı
    return null;
  }
} 