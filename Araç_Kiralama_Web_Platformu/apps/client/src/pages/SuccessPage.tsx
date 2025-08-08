import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Calendar, Car, MapPin } from 'lucide-react';

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state?.bookingData;

  const handleViewProfile = () => {
    navigate('/profile');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Başarı İkonu */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        {/* Başlık */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Kiralama Başarılı!
        </h1>
        
        <p className="text-gray-600 mb-8">
          Araç kiralama işleminiz başarıyla tamamlandı.
        </p>

        {/* Kiralama Detayları */}
        {bookingData && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Car className="w-5 h-5 mr-2" />
              Kiralama Detayları
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-gray-600">
                  {bookingData.startDate} - {bookingData.endDate}
                </span>
              </div>
              
              <div className="flex items-center text-sm">
                <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-gray-600">
                  Toplam: {bookingData.totalDays} gün
                </span>
              </div>
              
              <div className="pt-2 border-t border-gray-200">
                <span className="font-semibold text-lg text-green-600">
                  ₺{bookingData.totalAmount}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Butonlar */}
        <div className="space-y-4">
          <button
            onClick={handleViewProfile}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Profilimi Görüntüle
          </button>
          
          <button
            onClick={handleBackToHome}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Ana Sayfaya Dön
          </button>
        </div>

        {/* Bilgi */}
        <p className="text-xs text-gray-500 mt-6">
          Kiralama detayları profilinizde görüntülenebilir.
        </p>
      </div>
    </div>
  );
};

export default SuccessPage;



