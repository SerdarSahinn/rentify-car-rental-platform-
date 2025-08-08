import { Request, Response } from 'express';
import { PaymentService } from './service';
import { CreatePaymentDto } from './dto';

export class PaymentController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  // Ödeme oluştur
  async createPayment(req: Request, res: Response) {
    try {
      const paymentData: CreatePaymentDto = req.body;
      const payment = await this.paymentService.createPayment(paymentData);
      return res.status(201).json(payment);
    } catch (error) {
      return res.status(400).json({ error: 'Ödeme oluşturulamadı' });
    }
  }

  // Ödeme detaylarını getir
  async getPaymentById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const payment = await this.paymentService.getPaymentById(id);
      
      if (!payment) {
        return res.status(404).json({ error: 'Ödeme bulunamadı' });
      }
      
      return res.json(payment);
    } catch (error) {
      return res.status(500).json({ error: 'Ödeme getirilemedi' });
    }
  }

  // Kullanıcının ödemelerini getir
  async getUserPayments(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const payments = await this.paymentService.getUserPayments(userId);
      return res.json(payments);
    } catch (error) {
      return res.status(500).json({ error: 'Kullanıcı ödemeleri getirilemedi' });
    }
  }

  // Ödeme durumunu güncelle
  async updatePaymentStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const payment = await this.paymentService.updatePaymentStatus(id, status);
      
      if (!payment) {
        return res.status(404).json({ error: 'Ödeme bulunamadı' });
      }
      
      return res.json(payment);
    } catch (error) {
      return res.status(400).json({ error: 'Ödeme durumu güncellenemedi' });
    }
  }

  // Stripe webhook işleme
  async handleStripeWebhook(req: Request, res: Response) {
    try {
      const result = await this.paymentService.handleStripeWebhook(req);
      return res.json(result);
    } catch (error) {
      return res.status(400).json({ error: 'Webhook işlenemedi' });
    }
  }

  // Ödeme iptal et
  async cancelPayment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const payment = await this.paymentService.cancelPayment(id);
      
      if (!payment) {
        return res.status(404).json({ error: 'Ödeme bulunamadı' });
      }
      
      return res.json(payment);
    } catch (error) {
      return res.status(400).json({ error: 'Ödeme iptal edilemedi' });
    }
  }
} 