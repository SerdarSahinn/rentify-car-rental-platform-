import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Car, Star, MapPin, Users, Calendar, Heart, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import { vehicleApi } from '../services/api';
import { formatPrice, getVehicleImages, getCategoryDisplay } from '../utils/format';
import { useState } from 'react';
import ReviewComponent from '../components/ReviewComponent';

// Takvim Komponenti
const VehicleCalendar = ({ vehicleId }: { vehicleId: string }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const { data: calendarData, isLoading } = useQuery({
    queryKey: ['vehicle-calendar', vehicleId, year, month],
    queryFn: () => fetch(`/api/bookings/calendar/${vehicleId}?year=${year}&month=${month}`)
      .then(res => res.json()),
    enabled: !!vehicleId
  });

  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const getMonthName = (month: number) => {
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    return months[month - 1];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800 border-green-200';
      case 'BOOKED': return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'Müsait';
      case 'BOOKED': return 'Dolu';
      case 'PENDING': return 'Beklemede';
      default: return 'Bilinmiyor';
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const calendar = calendarData?.data?.calendar || [];
  const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
        <Calendar className="h-5 w-5 mr-2 text-blue-500" />
        Müsaitlik Takvimi
      </h3>
      
      {/* Ay Navigasyonu */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        
        <h4 className="text-lg font-semibold text-gray-900">
          {getMonthName(month)} {year}
        </h4>
        
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Hafta Başlıkları */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Takvim Günleri */}
      <div className="grid grid-cols-7 gap-1">
        {calendar.map((day: any) => (
          <div
            key={day.date}
            className={`
              h-12 flex items-center justify-center text-sm font-medium rounded-lg border
              ${getStatusColor(day.status)}
              ${day.status === 'AVAILABLE' ? 'cursor-pointer hover:bg-green-200' : 'cursor-default'}
            `}
            title={`${day.date}: ${getStatusText(day.status)}`}
          >
            {day.day}
          </div>
        ))}
      </div>

      {/* Durum Açıklamaları */}
      <div className="flex items-center justify-center space-x-4 mt-4 pt-4 border-t">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Müsait</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Dolu</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Beklemede</span>
        </div>
      </div>
    </div>
  );
};

const VehicleDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => vehicleApi.getVehicle(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-2xl mb-6"></div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle?.data) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Araç Bulunamadı</h2>
        <p className="text-gray-600">Aradığınız araç mevcut değil.</p>
      </div>
    );
  }

  const vehicleData = vehicle.data;
  const images = getVehicleImages(vehicleData.images);
  const mainImage = images[0] || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800';

  return (
    <div className="space-y-8">
      {/* Vehicle Images */}
      <div className="relative h-96 bg-gray-200 rounded-2xl overflow-hidden">
        <img
          src={mainImage}
          alt={`${vehicleData.brand} ${vehicleData.model}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 flex space-x-2">
          <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
            <Heart className="h-5 w-5 text-gray-600" />
          </button>
          <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
            <Share2 className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Vehicle Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Title and Rating */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {vehicleData.brand} {vehicleData.model}
            </h1>
            <div className="flex items-center space-x-4 text-gray-600">
              <span className="text-lg">{vehicleData.year}</span>
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="ml-1 font-medium">
                  {vehicleData.averageRating.toFixed(1)} ({vehicleData.totalReviews} yorum)
                </span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <MapPin className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Konum</p>
                <p className="font-medium">{vehicleData.location}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Koltuk</p>
                <p className="font-medium">{vehicleData.seats} kişi</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <Car className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Kategori</p>
                <p className="font-medium">{getCategoryDisplay(vehicleData.category)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-500">Toplam Kiralama</p>
                <p className="font-medium">{vehicleData.totalBookings}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Açıklama</h3>
            <p className="text-gray-600 leading-relaxed">{vehicleData.description}</p>
          </div>

          {/* Features List */}
          {vehicleData.features && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Özellikler</h3>
              <div className="grid grid-cols-2 gap-2">
                {JSON.parse(vehicleData.features).map((feature: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Müsaitlik Takvimi */}
          <VehicleCalendar vehicleId={id!} />

          {/* Yorumlar */}
          <ReviewComponent vehicleId={id!} />
        </div>

        {/* Booking Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 sticky top-8">
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-primary-600 mb-1">
                {formatPrice(vehicleData.dailyPrice)}
              </div>
              <div className="text-gray-500">günlük</div>
            </div>

            <div className="space-y-4">
              <Link 
                to={`/vehicles/${id}/book`}
                className="w-full btn btn-primary btn-lg flex items-center justify-center"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Hemen Kirala
              </Link>
              
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Ücretsiz iptal • 7/24 destek • Sigorta dahil
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailPage; 