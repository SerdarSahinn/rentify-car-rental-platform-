import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, CreditCard, AlertCircle } from 'lucide-react';
import { vehicleApi } from '../services/api';
import { createBooking } from '../services/bookingApi';
import type { Vehicle } from '../types';
import { useUser } from '@clerk/clerk-react';

interface BookingFormData {
  startDate: string;
  endDate: string;
  notes: string;
}

const BookingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useUser();

  const [formData, setFormData] = useState<BookingFormData>({
    startDate: '',
    endDate: '',
    notes: ''
  });
  const [bookingId, setBookingId] = useState<string | null>(null);

  const [totalDays, setTotalDays] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // Araç bilgilerini getir
  const { data: vehicleResponse, isLoading: vehicleLoading } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => vehicleApi.getVehicle(id!),
    enabled: !!id
  });

  const vehicle = vehicleResponse?.data as Vehicle;

  // Kiralama oluşturma mutation
  const createBookingMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: (data) => {
      console.log('🔍 Booking success callback çalıştı');
      console.log('🔍 Response data:', data);
      
      setBookingId(data.id);
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      
      // Başarılı kiralama sonrası yönlendirme
      const bookingDataForSuccess = {
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalDays: totalDays,
        totalAmount: totalPrice
      };
      
      console.log('🔍 Navigate to /success with data:', bookingDataForSuccess);
      navigate('/success', { 
        state: { bookingData: bookingDataForSuccess } 
      });
    },
    onError: (error: any) => {
      console.error('🔍 Booking error:', error);
      alert(error.message);
    }
  });

  // Tarih değişikliklerini hesapla
  useEffect(() => {
    if (formData.startDate && formData.endDate && vehicle) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      
      setTotalDays(days);
      setTotalPrice(days * vehicle.dailyPrice);
    }
  }, [formData.startDate, formData.endDate, vehicle]);

  // Minimum tarih (bugün)
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔍 handleSubmit çağrıldı');
    
    if (!id) {
      alert('Araç ID bulunamadı');
      return;
    }
    
    if (!formData.startDate || !formData.endDate) {
      alert('Lütfen tarih seçin');
      return;
    }

    if (totalDays <= 0) {
      alert('Geçersiz tarih aralığı');
      return;
    }

    console.log('🔍 Kiralama oluşturuluyor...');
    console.log('🔍 Kullanıcı email:', user?.emailAddresses[0]?.emailAddress);
    
    createBookingMutation.mutate({
      vehicleId: id,
      startDate: formData.startDate,
      endDate: formData.endDate,
      notes: formData.notes,
      userEmail: user?.emailAddresses[0]?.emailAddress
    });
  };

  if (vehicleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Araç Bulunamadı</h2>
          <p className="text-gray-600">Aradığınız araç mevcut değil.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Araç Kirala
          </h1>
          <p className="text-lg text-gray-600">
            {vehicle.brand} {vehicle.model} ({vehicle.year})
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sol Panel - Araç Bilgileri */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="mb-6">
              <img
                src={typeof vehicle.images === 'string' 
                  ? JSON.parse(vehicle.images)[0] || '/placeholder-car.jpg'
                  : vehicle.images?.[0] || '/placeholder-car.jpg'
                }
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-64 object-cover rounded-xl mb-4"
              />
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Marka</span>
                  <span className="font-semibold">{vehicle.brand}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Model</span>
                  <span className="font-semibold">{vehicle.model}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Yıl</span>
                  <span className="font-semibold">{vehicle.year}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Günlük Fiyat</span>
                  <span className="font-semibold text-blue-600">
                    ₺{vehicle.dailyPrice}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Yakıt Tipi</span>
                  <span className="font-semibold">{vehicle.fuelType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Vites</span>
                  <span className="font-semibold">{vehicle.transmission}</span>
                </div>
              </div>
            </div>

            {/* Özellikler - Geçici olarak kaldırıldı */}
          </div>

          {/* Sağ Panel - Kiralama Formu */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold mb-6">Kiralama Detayları</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tarih Seçimi */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-2" />
                    Başlangıç Tarihi
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    min={today}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-2" />
                    Bitiş Tarihi
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    min={formData.startDate || today}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Notlar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notlar (Opsiyonel)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Özel istekleriniz varsa buraya yazabilirsiniz..."
                />
              </div>

              {/* Fiyat Özeti */}
              {totalDays > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-gray-900">Fiyat Özeti</h3>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Günlük Fiyat</span>
                    <span>₺{vehicle.dailyPrice}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Toplam Gün</span>
                    <span>{totalDays} gün</span>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Toplam Tutar</span>
                      <span className="text-blue-600">₺{totalPrice}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Butonlar */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={createBookingMutation.isPending || totalDays <= 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                >
                  {createBookingMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      İşleniyor...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-5 w-5 mr-2" />
                      Kiralama Oluştur
                    </>
                  )}
                </button>
                
                {bookingId && (
                  <button
                    type="button"
                    onClick={() => navigate(`/payments/${bookingId}`)}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-green-700 hover:to-emerald-700 focus:ring-4 focus:ring-green-300 transition-all duration-200 flex items-center justify-center"
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    Ödeme Yap - ₺{totalPrice}
                  </button>
                )}
              </div>
            </form>

            {/* Bilgilendirme */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Önemli Bilgiler:</p>
                  <ul className="space-y-1">
                    <li>• Kiralama onaylandıktan sonra ödeme yapılacaktır</li>
                    <li>• İptal işlemleri 24 saat öncesine kadar yapılabilir</li>
                    <li>• Araç teslimi ve iadesi için kimlik gerekli</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage; 