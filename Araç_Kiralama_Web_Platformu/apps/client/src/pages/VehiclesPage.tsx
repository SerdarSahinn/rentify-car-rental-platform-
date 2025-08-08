import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Users, Filter } from 'lucide-react';
import { vehicleApi } from '../services/api';
import type { Vehicle } from '../types/index.js';
import { formatPrice, getVehicleImages, getCategoryDisplay } from '../utils/format';
import { useAuth } from '../hooks/useAuth';

const VehiclesPage = () => {
  const { requireAuth } = useAuth();
  const navigate = useNavigate();
  
  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehicleApi.getVehicles(),
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
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => requireAuth(() => {
                navigate(`/vehicles/${vehicle.id}/book`);
              })}
            >
              Kirala
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Araçlar</h1>
          <p className="text-gray-600 mt-2">İhtiyacınıza uygun araçları keşfedin</p>
        </div>
        <button className="btn btn-outline">
          <Filter className="h-4 w-4 mr-2" />
          Filtrele
        </button>
      </div>

      {/* Vehicles Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
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
          {vehicles?.data.map(renderVehicleCard)}
        </div>
      )}
    </div>
  );
};

export default VehiclesPage; 