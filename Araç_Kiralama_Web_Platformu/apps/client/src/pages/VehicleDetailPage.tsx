import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Car, Star, MapPin, Users, Calendar, Clock, Fuel, Settings, Shield, CreditCard, CheckCircle } from 'lucide-react';
import { vehicleApi } from '../services/api';
import type { Vehicle, Review } from '../types/index.js';
import { formatPrice, getVehicleImages, getCategoryDisplay, getFuelTypeDisplay, getTransmissionDisplay } from '../utils/format';

const VehicleDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState(0);
  const [reservationData, setReservationData] = useState({
    startDate: '',
    endDate: '',
    pickupLocation: '',
    returnLocation: '',
  });

  const { data: vehicleResponse, isLoading } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => vehicleApi.getVehicleById(id!),
    enabled: !!id,
  });

  const vehicle = vehicleResponse?.data;

  const { data: reviewsResponse } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => vehicleApi.getVehicleReviews(id!),
    enabled: !!id,
  });

  const reviews = reviewsResponse?.data;

  const handleReservation = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement reservation logic
    console.log('Rezervasyon:', reservationData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Araç bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Debug bilgisi
  console.log('Vehicle Response:', vehicleResponse);
  console.log('Vehicle Data:', vehicle);

  if (!vehicle) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Araç Bulunamadı</h2>
        <p className="text-gray-600 mb-6">Aradığınız araç mevcut değil veya kaldırılmış olabilir.</p>
        <Link
          to="/vehicles"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          Araçlara Dön
        </Link>
      </div>
    );
  }

  const images = getVehicleImages(vehicle.images);
  const features = vehicle.features ? JSON.parse(vehicle.features) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
        <Link to="/" className="hover:text-blue-600">Ana Sayfa</Link>
        <span>/</span>
        <Link to="/vehicles" className="hover:text-blue-600">Araçlar</Link>
        <span>/</span>
        <span className="text-gray-900">{vehicle.brand} {vehicle.model}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Kolon - Araç Bilgileri */}
        <div className="lg:col-span-2 space-y-8">
          {/* Galeri */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
            <div className="relative h-96">
              <img
                src={images[selectedImage] || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800'}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-full object-cover"
              />
              {vehicle.isFeatured && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  ⭐ Öne Çıkan Araç
                </div>
              )}
            </div>
            
            {/* Küçük Resimler */}
            {images.length > 1 && (
              <div className="p-4 flex space-x-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${vehicle.brand} ${vehicle.model} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Araç Bilgileri */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {vehicle.brand} {vehicle.model}
                </h1>
                <p className="text-gray-600">{vehicle.year} • {getCategoryDisplay(vehicle.category)}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {formatPrice(vehicle.dailyPrice)}
                </div>
                <div className="text-sm text-gray-500">günlük</div>
              </div>
            </div>

            {/* Özellikler */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-gray-600">{vehicle.seats} Koltuk</span>
              </div>
              <div className="flex items-center space-x-2">
                <Fuel className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-600">{getFuelTypeDisplay(vehicle.fuelType)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-purple-500" />
                <span className="text-sm text-gray-600">{getTransmissionDisplay(vehicle.transmission)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-red-500" />
                <span className="text-sm text-gray-600">{vehicle.location}</span>
              </div>
            </div>

            {/* Açıklama */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Açıklama</h3>
              <p className="text-gray-600 leading-relaxed">
                {vehicle.description || 'Bu araç hakkında detaylı bilgi yakında eklenecektir.'}
              </p>
            </div>

            {/* Özellikler Listesi */}
            {features.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Özellikler</h3>
                <div className="grid grid-cols-2 gap-2">
                  {features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Yorumlar */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Müşteri Yorumları</h3>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <span className="font-semibold">{vehicle.averageRating.toFixed(1)}</span>
                <span className="text-gray-500">({vehicle.totalReviews} yorum)</span>
              </div>
            </div>

            {reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.slice(0, 3).map((review: Review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-600">
                            {review.userName?.charAt(0) || 'A'}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">{review.userName || 'Anonim'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Henüz yorum yapılmamış.</p>
            )}
          </div>
        </div>

        {/* Sağ Kolon - Rezervasyon Formu */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Rezervasyon Yap</h3>
            
            <form onSubmit={handleReservation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alış Tarihi
                </label>
                <input
                  type="date"
                  required
                  value={reservationData.startDate}
                  onChange={(e) => setReservationData({ ...reservationData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teslim Tarihi
                </label>
                <input
                  type="date"
                  required
                  value={reservationData.endDate}
                  onChange={(e) => setReservationData({ ...reservationData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alış Lokasyonu
                </label>
                <select
                  required
                  value={reservationData.pickupLocation}
                  onChange={(e) => setReservationData({ ...reservationData, pickupLocation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Lokasyon seçin</option>
                  <option value="istanbul-havalimani">İstanbul Havalimanı</option>
                  <option value="sabiha-gokcen">Sabiha Gökçen</option>
                  <option value="kadikoy">Kadıköy</option>
                  <option value="beşiktaş">Beşiktaş</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teslim Lokasyonu
                </label>
                <select
                  required
                  value={reservationData.returnLocation}
                  onChange={(e) => setReservationData({ ...reservationData, returnLocation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Lokasyon seçin</option>
                  <option value="istanbul-havalimani">İstanbul Havalimanı</option>
                  <option value="sabiha-gokcen">Sabiha Gökçen</option>
                  <option value="kadikoy">Kadıköy</option>
                  <option value="beşiktaş">Beşiktaş</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                Rezervasyon Yap
              </button>
            </form>

            {/* Güvenlik Bilgileri */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-2 mb-3">
                <Shield className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-gray-900">Güvenli Ödeme</span>
              </div>
              <div className="flex items-center space-x-2 mb-3">
                <CreditCard className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-900">Kredi Kartı ile Ödeme</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <span className="text-sm font-medium text-gray-900">7/24 Destek</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailPage; 