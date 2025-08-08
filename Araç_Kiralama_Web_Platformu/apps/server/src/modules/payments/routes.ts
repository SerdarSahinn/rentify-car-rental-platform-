import { Router } from 'express';
import { PaymentController } from './controller';
import { authMiddleware } from '../../middlewares/auth';

const router = Router();
const paymentController = new PaymentController();

// Ödeme oluştur
router.post('/', authMiddleware, paymentController.createPayment.bind(paymentController));

// Ödeme detaylarını getir
router.get('/:id', authMiddleware, paymentController.getPaymentById.bind(paymentController));

// Kullanıcının ödemelerini getir
router.get('/user/:userId', authMiddleware, paymentController.getUserPayments.bind(paymentController));

// Ödeme durumunu güncelle
router.patch('/:id/status', authMiddleware, paymentController.updatePaymentStatus.bind(paymentController));

// Ödeme iptal et
router.patch('/:id/cancel', authMiddleware, paymentController.cancelPayment.bind(paymentController));

// Stripe webhook (auth gerektirmez)
router.post('/webhook', paymentController.handleStripeWebhook.bind(paymentController));

export default router; 