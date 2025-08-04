import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Car, Star, MapPin, Users, Calendar } from 'lucide-react';
import { vehicleApi } from '../services/api';
import type { Vehicle } from '../types/index.js';
import { formatPrice, getVehicleImages, getCategoryDisplay } from '../utils/format';

const HomePage = () => {
  const { data: featuredVehicles, isLoading } = useQuery({
    queryKey: ['featured-vehicles'],
    queryFn: () => vehicleApi.getFeaturedVehicles(),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => vehicleApi.getCategories(),
  });

  const renderVehicleCard = (vehicle: Vehicle) => {
    const images = getVehicleImages(vehicle.images);
    const mainImage = images[0] || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800';

    return (
      <div key={vehicle.id} className="card overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative h-48 bg-gray-200">
          <img
            src={mainImage}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="w-full h-full object-cover"
          />
          {vehicle.isFeatured && (
            <div className="absolute top-2 left-2 bg-primary-600 text-white px-2 py-1 rounded text-xs font-medium">
              Öne Çıkan
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {vehicle.brand} {vehicle.model}
            </h3>
            <span className="text-sm text-gray-500">{vehicle.year}</span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
            <span className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {vehicle.location}
            </span>
            <span className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {vehicle.seats} koltuk
            </span>
          </div>

          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">
              {getCategoryDisplay(vehicle.category)}
            </span>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600 ml-1">
                {vehicle.averageRating.toFixed(1)} ({vehicle.totalReviews})
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-primary-600">
                {formatPrice(vehicle.dailyPrice)}
              </span>
              <span className="text-sm text-gray-500">/gün</span>
            </div>
            <Link
              to={`/vehicles/${vehicle.id}`}
              className="btn btn-primary btn-sm"
            >
              Detaylar
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative px-8 py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Araç Kiralamada
            <br />
            <span className="text-primary-200">Yeni Dönem</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
            Türkiye'nin en güvenilir araç kiralama platformu ile seyahatlerinizi 
            unutulmaz kılın.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/vehicles"
              className="btn btn-lg bg-white text-primary-600 hover:bg-gray-100"
            >
              Araçları Keşfet
            </Link>
            <button className="btn btn-lg border-2 border-white text-white hover:bg-white hover:text-primary-600">
              Nasıl Çalışır?
            </button>
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Öne Çıkan Araçlar</h2>
          <Link
            to="/vehicles"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Tümünü Gör →
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredVehicles?.data.map(renderVehicleCard)}
          </div>
        )}
      </section>

      {/* Categories */}
      {categories && (
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Araç Kategorileri</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.data.map((category) => (
              <Link
                key={category}
                to={`/vehicles?category=${category}`}
                className="card p-6 text-center hover:shadow-lg transition-shadow"
              >
                <Car className="h-12 w-12 text-primary-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900">
                  {getCategoryDisplay(category)}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Features */}
      <section className="bg-white rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Neden Rentify?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Car className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Geniş Araç Filosu
            </h3>
            <p className="text-gray-600">
              Ekonomik araçlardan lüks modellere kadar her ihtiyaca uygun araç seçenekleri.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Kolay Rezervasyon
            </h3>
            <p className="text-gray-600">
              Sadece birkaç tıklama ile araç rezervasyonu yapın, anında onay alın.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Güvenilir Hizmet
            </h3>
            <p className="text-gray-600">
              Müşteri memnuniyeti odaklı hizmet anlayışı ve 7/24 destek.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 