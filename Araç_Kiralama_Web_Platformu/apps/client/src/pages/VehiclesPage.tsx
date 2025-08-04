import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Car, Star, MapPin, Users, Search, Filter } from 'lucide-react';
import { vehicleApi } from '../services/api';
import type { Vehicle, VehicleFilters } from '../types/index.js';
import { formatPrice, getVehicleImages, getCategoryDisplay } from '../utils/format';

const VehiclesPage = () => {
  const [filters, setFilters] = useState<VehicleFilters>({
    page: 1,
    limit: 12,
  });

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['vehicles', filters],
    queryFn: () => vehicleApi.getVehicles(filters),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => vehicleApi.getCategories(),
  });

  const renderVehicleCard = (vehicle: Vehicle) => {
    const images = getVehicleImages(vehicle.images);
    const mainImage = images[0] || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800';

    return (
      <div key={vehicle.id} className="group bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-2 border border-white/20">
        <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200">
          <img
            src={mainImage}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          {vehicle.isFeatured && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
              ⭐ Öne Çıkan
            </div>
          )}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-lg">
            {vehicle.year}
          </div>
        </div>
        <div className="p-6">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
              {vehicle.brand} {vehicle.model}
            </h3>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
            <span className="flex items-center bg-blue-50 px-3 py-1.5 rounded-full">
              <MapPin className="h-4 w-4 mr-1.5 text-blue-500" />
              {vehicle.location}
            </span>
            <span className="flex items-center bg-green-50 px-3 py-1.5 rounded-full">
              <Users className="h-4 w-4 mr-1.5 text-green-500" />
              {vehicle.seats} koltuk
            </span>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
              {getCategoryDisplay(vehicle.category)}
            </span>
            <div className="flex items-center bg-yellow-50 px-3 py-1.5 rounded-full">
              <Star className="h-4 w-4 text-yellow-500 fill-current mr-1.5" />
              <span className="text-sm font-semibold text-gray-700">
                {vehicle.averageRating.toFixed(1)} ({vehicle.totalReviews})
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {formatPrice(vehicle.dailyPrice)}
              </span>
              <span className="text-sm text-gray-500 font-medium">/gün</span>
            </div>
            <Link
              to={`/vehicles/${vehicle.id}`}
              className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Detaylar
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
          Premium Araç Filosu
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Lüks araçlardan ekonomik modellere kadar geniş filomuzdan size en uygun olanını seçin. 
          <span className="font-semibold text-blue-600"> Premium araç kiralama deneyimi</span> için Rentify'ı tercih edin.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl shadow-blue-500/5 border border-white/20">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
            <Filter className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Gelişmiş Filtreler</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ara
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Marka, model ara..."
                className="input pl-10"
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori
            </label>
            <select
              className="input"
              value={filters.category || ''}
              onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
            >
              <option value="">Tümü</option>
              {categories?.data.map((category) => (
                <option key={category} value={category}>
                  {getCategoryDisplay(category)}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Fiyat
            </label>
            <input
              type="number"
              placeholder="Min fiyat"
              className="input"
              value={filters.minPrice || ''}
              onChange={(e) => setFilters({ ...filters, minPrice: Number(e.target.value), page: 1 })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Fiyat
            </label>
            <input
              type="number"
              placeholder="Max fiyat"
              className="input"
              value={filters.maxPrice || ''}
              onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value), page: 1 })}
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isLoading ? 'Yükleniyor...' : `${vehicles?.data.length || 0} araç bulundu`}
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {vehicles?.data.map(renderVehicleCard)}
            </div>

            {/* Pagination */}
            {vehicles?.pagination && vehicles.pagination.pages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex space-x-2">
                  {Array.from({ length: vehicles.pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setFilters({ ...filters, page })}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        page === filters.page
                          ? 'bg-primary-600 text-white'
                                                     : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VehiclesPage; 