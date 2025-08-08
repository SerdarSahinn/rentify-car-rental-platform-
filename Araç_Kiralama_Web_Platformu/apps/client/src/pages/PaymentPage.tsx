import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { createPaymentIntent, confirmPayment } from '../services/paymentApi.js';
import { getBookingById } from '../services/bookingApi';
// useAuth kaldırıldı çünkü kullanılmıyor
import type { Booking } from '../types';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

const PaymentForm = ({ booking, onSuccess }: { booking: Booking; onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  // requireAuth kaldırıldı çünkü zaten authenticated route
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPaymentIntentMutation = useMutation({
    mutationFn: createPaymentIntent,
    onSuccess: async (data: { data: { clientSecret: string } }) => {
      if (!stripe || !elements) return;

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        data.data.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
          }
        }
      );

      if (stripeError) {
        setError(stripeError.message || 'Ödeme başarısız');
        setIsProcessing(false);
      } else if (paymentIntent) {
        // Ödeme onayı
        try {
          await confirmPayment(paymentIntent.id, booking.id);
          onSuccess();
        } catch (error: any) {
          setError(error.message);
          setIsProcessing(false);
        }
      }
    },
    onError: (error: any) => {
      setError(error.message);
      setIsProcessing(false);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // requireAuth kontrolü kaldırıldı çünkü zaten authenticated route
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    createPaymentIntentMutation.mutate(booking.id);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Kart Bilgileri</h3>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            İşleniyor...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            ₺{booking.totalPrice} Öde
          </>
        )}
      </button>
    </form>
  );
};

const PaymentPage = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const { data: bookingResponse, isLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => getBookingById(bookingId!),
    enabled: !!bookingId
  });

  const booking = bookingResponse?.data as Booking;

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    queryClient.invalidateQueries({ queryKey: ['bookings'] });
    
    setTimeout(() => {
      navigate('/profile', { 
        state: { message: 'Ödeme başarıyla tamamlandı!' }
      });
    }, 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Kiralama Bulunamadı</h2>
          <p className="text-gray-600">Aradığınız kiralama mevcut değil.</p>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ödeme Başarılı!</h2>
          <p className="text-gray-600">Kiralama işleminiz tamamlandı.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ödeme</h1>
          <p className="text-gray-600">
            {booking.vehicle?.brand} {booking.vehicle?.model} ({booking.vehicle?.year})
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Kiralama Özeti</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Başlangıç Tarihi</span>
              <span>{new Date(booking.startDate).toLocaleDateString('tr-TR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Bitiş Tarihi</span>
              <span>{new Date(booking.endDate).toLocaleDateString('tr-TR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Toplam Gün</span>
              <span>{booking.totalDays} gün</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Toplam Tutar</span>
                <span className="text-blue-600">₺{booking.totalPrice}</span>
              </div>
            </div>
          </div>
        </div>

        <Elements stripe={stripePromise}>
          <PaymentForm booking={booking} onSuccess={handlePaymentSuccess} />
        </Elements>
      </div>
    </div>
  );
};

export default PaymentPage; 