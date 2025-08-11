import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Users, Filter, X, Car, Zap, Shield, Wifi, Snowflake } from 'lucide-react';
import { vehicleApi } from '../services/api';
import type { Vehicle } from '../types/index.js';
import { formatPrice, getVehicleImages, getCategoryDisplay } from '../utils/format';
import { useAuth } from '../hooks/useAuth';
import { useClerkToken } from '../hooks/useClerkToken';
import { useState, useEffect } from 'react';

const VehiclesPage = () => {
  const { requireAuth } = useAuth();
  const { getAuthToken } = useClerkToken();
  const navigate = useNavigate();
  
  // CSS stilleri
  const styles = `
    .slider::-webkit-slider-thumb {
      appearance: none;
      height: 24px;
      width: 24px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      cursor: pointer;
      border: 3px solid #ffffff;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
      transition: all 0.2s ease;
    }
    .slider::-webkit-slider-thumb:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(59, 130, 246, 0.6);
    }
    .slider::-moz-range-thumb {
      height: 24px;
      width: 24px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      cursor: pointer;
      border: 3px solid #ffffff;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
      transition: all 0.2s ease;
    }
    .slider::-moz-range-thumb:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(59, 130, 246, 0.6);
    }
    .slider::-webkit-slider-track {
      width: 100%;
      height: 8px;
      cursor: pointer;
      border-radius: 4px;
      border: none;
    }
    .slider::-moz-range-track {
      width: 100%;
      height: 8px;
      cursor: pointer;
      border-radius: 4px;
      border: none;
    }
  `;
  
  // Filtreleme state'i
  const [showFilters, setShowFilters] = useState(false);
  
  // Yeni filtreleme state'leri
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [passengerCount, setPassengerCount] = useState<number | null>(null);
  const [transmissionType, setTransmissionType] = useState<string>('');
  const [fuelType, setFuelType] = useState<string>('');
  






  // Filtreleme fonksiyonu
  const filterVehicles = (vehicles: Vehicle[]) => {
    if (!vehicles) return [];
    
    return vehicles.filter(vehicle => {
      // Fiyat aralığı kontrolü
      if (vehicle.dailyPrice < priceRange[0] || vehicle.dailyPrice > priceRange[1]) {
        return false;
      }
      
      // Kategori kontrolü
      if (selectedCategories.length > 0 && !selectedCategories.includes(vehicle.category)) {
        return false;
      }
      
      // Marka kontrolü
      if (selectedBrands.length > 0 && !selectedBrands.includes(vehicle.brand)) {
        return false;
      }
      
      // Yolcu sayısı kontrolü
      if (passengerCount !== null && vehicle.seats !== passengerCount) {
        return false;
      }
      
      // Vites tipi kontrolü (case-insensitive)
      if (transmissionType) {
        const vehicleTransmission = vehicle.transmission?.toLowerCase() || '';
        const filterTransmission = transmissionType.toLowerCase();
        
        // Türkçe-İngilizce eşleştirme
        const transmissionMap: { [key: string]: string[] } = {
          'manuel': ['manuel', 'manual'],
          'otomatik': ['otomatik', 'automatic', 'auto'],
          'yarı otomatik': ['yarı otomatik', 'semi-automatic', 'semi automatic']
        };
        
        const allowedValues = transmissionMap[filterTransmission] || [filterTransmission];
        const isMatch = allowedValues.some(value => vehicleTransmission.includes(value));
        
        if (!isMatch) {
          if (import.meta.env?.DEV) {
            console.log('❌ Vites tipi eşleşmedi:', {
              vehicle: vehicle.transmission,
              filter: transmissionType,
              vehicleId: vehicle.id
            });
          }
          return false;
        }
      }
      
      // Yakıt tipi kontrolü (case-insensitive)
      if (fuelType) {
        const vehicleFuel = vehicle.fuelType?.toLowerCase() || '';
        const filterFuel = fuelType.toLowerCase();
        
        // Türkçe-İngilizce eşleştirme
        const fuelMap: { [key: string]: string[] } = {
          'benzin': ['benzin', 'gasoline', 'petrol'],
          'dizel': ['dizel', 'diesel'],
          'elektrik': ['elektrik', 'electric'],
          'hibrit': ['hibrit', 'hybrid'],
          'lpg': ['lpg', 'lpg']
        };
        
        const allowedValues = fuelMap[filterFuel] || [filterFuel];
        const isMatch = allowedValues.some(value => vehicleFuel.includes(value));
        
        if (!isMatch) {
          if (import.meta.env?.DEV) {
            console.log('❌ Yakıt tipi eşleşmedi:', {
              vehicle: vehicle.fuelType,
              filter: fuelType,
              vehicleId: vehicle.id
            });
          }
          return false;
        }
      }
      
      // Özellikler kontrolü (features JSON string'den parse edilir)
      if (selectedFeatures.length > 0) {
        try {
          const vehicleFeatures = JSON.parse(vehicle.features || '[]');
          const hasRequiredFeatures = selectedFeatures.every(feature => 
            vehicleFeatures.includes(feature)
          );
          
          if (!hasRequiredFeatures) {
            return false;
          }
        } catch (error) {
          // JSON parse hatası durumunda özellik kontrolü yapılmaz
          console.warn('Vehicle features parse error:', error);
        }
      }
      
      return true;
    });
  };



  const renderVehicleCard = (vehicle: Vehicle) => {
    const images = getVehicleImages(vehicle.images);
    const mainImage = images[0] || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800';

    return (
      <div key={vehicle.id} className={`card overflow-hidden hover:shadow-lg transition-shadow ${!vehicle.isAvailable ? 'opacity-60' : ''}`}>
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



          <div className="flex flex-col justify-between h-24">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-primary-600">
                {formatPrice(vehicle.dailyPrice)}
              </span>
              <span className="text-sm text-gray-500">/gün</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <button 
                className="btn btn-primary btn-sm w-full sm:w-auto text-sm px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white border-0"
                onClick={() => navigate(`/vehicles/${vehicle.id}`)}
              >
                Detaylar
              </button>
              <button 
                className={`btn btn-sm w-full sm:w-auto text-sm px-4 py-2 ${
                  vehicle.isAvailable === false 
                    ? 'btn-disabled opacity-50 bg-gray-400 text-white border-0' 
                    : 'btn-primary bg-green-600 hover:bg-green-700 text-white border-0'
                }`}
                disabled={vehicle.isAvailable === false}
                onClick={() => requireAuth(() => {
                  navigate(`/vehicles/${vehicle.id}/book`);
                })}
              >
                {vehicle.isAvailable === false ? 'Dolu' : 'Kirala'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // API'den araçları getir
  const { data: vehicles, isLoading, refetch } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      try {
        const token = await getAuthToken();
        console.log('🔑 Token alındı:', token ? 'Var' : 'Yok');
        
        if (!token) {
          console.log('⚠️ Token yok, API çağrısı yapılamıyor');
          // Token yoksa da API'yi çağırmayı dene
          const result = await vehicleApi.getVehicles();
          console.log('🚗 API Response (no token):', result);
          return result;
        }
        
        // Tüm araçları getir (filtreleme client-side yapılacak)
        const result = await vehicleApi.getVehicles();
        console.log('🚗 API Response:', result);
        console.log('🚗 Vehicles data:', result?.data);
        console.log('🚗 Vehicles count:', result?.data?.length);
        return result;
      } catch (error) {
        console.error('❌ API Error:', error);
        throw error;
      }
    },
    enabled: true, // Her zaman aktif et
    retry: 3, // 3 kez dene
    retryDelay: 1000, // 1 saniye bekle
  });

  // Manuel API test
  const testApi = async () => {
    try {
      console.log('🧪 Manuel API test başlıyor...');
      const response = await fetch('http://localhost:3001/api/vehicles');
      console.log('🧪 Fetch response status:', response.status);
      const data = await response.json();
      console.log('🧪 Fetch response data:', data);
    } catch (error) {
      console.error('🧪 Fetch error:', error);
    }
  };

  // Sayfa yüklendiğinde API test et
  useEffect(() => {
    testApi();
  }, []);

  // Debug için vehicles state'ini izle
  useEffect(() => {
    console.log('🔍 Vehicles state changed:', {
      vehicles,
      isLoading,
      vehiclesData: vehicles?.data,
      vehiclesCount: vehicles?.data?.length
    });
  }, [vehicles, isLoading]);

  // Filtreleme state'lerini izle ve otomatik filtreleme yap
  useEffect(() => {
    if (vehicles?.data) {
      // Filtreleme otomatik olarak yapılır, ekstra işlem gerekmez
      if (import.meta.env?.DEV) {
        console.log('🔍 FILTER UPDATE:', {
          priceRange,
          selectedCategories,
          selectedBrands,
          selectedFeatures,
          passengerCount,
          transmissionType,
          fuelType
        });
        console.log('🚗 Filtered vehicles count:', filterVehicles(vehicles.data).length);
      }
    }
  }, [priceRange, selectedCategories, selectedBrands, selectedFeatures, passengerCount, transmissionType, fuelType, vehicles?.data]);

  return (
    <>
      <style>{styles}</style>
      <div className="flex gap-8">
      {/* Ana İçerik */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Araçlar</h1>
            <p className="text-gray-600 mt-2">İhtiyacınıza uygun araçları keşfedin</p>
          </div>
          <button 
            className="btn btn-outline lg:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Filtreleri Gizle' : 'Filtrele'}
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
           <>
             {/* Filtreleme Sonuçları */}
             {vehicles?.data && (
               <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center space-x-2">
                     <span className="text-sm text-blue-700">
                       <strong>Toplam {vehicles.data.length}</strong> araç bulundu
                     </span>
                     {filterVehicles(vehicles.data).length !== vehicles.data.length && (
                       <span className="text-sm text-blue-600">
                         • <strong>{filterVehicles(vehicles.data).length}</strong> araç filtrelendi
                       </span>
                     )}
                   </div>
                   {(selectedCategories.length > 0 || selectedBrands.length > 0 || selectedFeatures.length > 0 || 
                     passengerCount !== null || transmissionType || fuelType || 
                     priceRange[0] > 0 || priceRange[1] < 1000) && (
                     <button
                       onClick={() => {
                         setPriceRange([0, 1000]);
                         setSelectedCategories([]);
                         setSelectedBrands([]);
                         setSelectedFeatures([]);
                         setPassengerCount(null);
                         setTransmissionType('');
                         setFuelType('');
                       }}
                       className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                     >
                       Filtreleri Temizle
                     </button>
                   )}
                 </div>
               </div>
             )}
             
             {/* Filtrelenmiş Araçlar */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {(() => {
                 const filteredVehicles = filterVehicles(vehicles?.data || []);
                 console.log('🎯 Render - Filtered vehicles:', filteredVehicles);
                 console.log('🎯 Render - Vehicles data:', vehicles?.data);
                 console.log('🎯 Render - Filtered count:', filteredVehicles.length);
                 return filteredVehicles.map(renderVehicleCard);
               })()}
             </div>
             
             {/* Filtreleme Sonucu Boşsa */}
             {vehicles?.data && filterVehicles(vehicles.data).length === 0 && (
               <div className="text-center py-12">
                 <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                   <Car className="w-12 h-12 text-gray-400" />
                 </div>
                 <h3 className="text-lg font-semibold text-gray-900 mb-2">Araç Bulunamadı</h3>
                 <p className="text-gray-600 mb-4">
                   Seçilen filtrelerde uygun araç bulunamadı. Filtreleri değiştirmeyi deneyin.
                 </p>
                 <button
                   onClick={() => {
                     setPriceRange([0, 1000]);
                     setSelectedCategories([]);
                     setSelectedBrands([]);
                     setSelectedFeatures([]);
                     setPassengerCount(null);
                     setTransmissionType('');
                     setFuelType('');
                   }}
                   className="btn btn-primary"
                 >
                   Filtreleri Temizle
                 </button>
               </div>
             )}
           </>
         )}
      </div>

      {/* Sağ Sidebar Filtreleme Paneli */}
      <div className={`w-80 lg:block ${showFilters ? 'block' : 'hidden'}`}>
        <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-3xl p-6 shadow-2xl border border-blue-100 dark:border-gray-600 sticky top-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                <Filter className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  Filtreler
                </h3>
                <p className="text-xs text-blue-500 dark:text-blue-400 font-medium">Araçlarınızı bulun</p>
              </div>
            </div>
            <button 
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
              onClick={() => setShowFilters(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Fiyat Aralığı */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mr-2"></div>
                Fiyat Aralığı
              </h4>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">₺/gün</span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium">₺{priceRange[0]}</span>
                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full font-medium">₺{priceRange[1]}</span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="slider w-full h-3 bg-gradient-to-r from-blue-200 to-indigo-200 dark:from-gray-600 dark:to-gray-500 rounded-full appearance-none cursor-pointer"
                />
                <div className="absolute top-0 left-0 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" style={{width: `${(priceRange[1] / 1000) * 100}%`}}></div>
              </div>
            </div>
          </div>

          {/* Kategori Filtreleme */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mr-2"></div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Kategori</h4>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {['Sedan', 'SUV', 'Hatchback', 'Van', 'Pickup', 'Lüks'].map((category) => (
                <label key={category} className="relative cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCategories([...selectedCategories, category]);
                      } else {
                        setSelectedCategories(selectedCategories.filter(c => c !== category));
                      }
                    }}
                    className="sr-only"
                  />
                  <div className={`p-3 rounded-xl border-2 transition-all duration-200 group-hover:scale-105 ${
                    selectedCategories.includes(category)
                      ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-purple-300 dark:hover:border-purple-400 hover:shadow-sm'
                  }`}>
                    <span className={`text-sm font-medium ${
                      selectedCategories.includes(category)
                        ? 'text-purple-700 dark:text-purple-300'
                        : 'text-gray-600 dark:text-gray-200'
                    }`}>
                      {category}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Marka Filtreleme */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full mr-2"></div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Marka</h4>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {['BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Toyota', 'Honda', 'Ford', 'Renault'].map((brand) => (
                <label key={brand} className="relative cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedBrands([...selectedBrands, brand]);
                      } else {
                        setSelectedBrands(selectedBrands.filter(b => b !== brand));
                      }
                    }}
                    className="sr-only"
                  />
                  <div className={`p-3 rounded-xl border-2 transition-all duration-200 group-hover:scale-105 ${
                    selectedBrands.includes(brand)
                      ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-400 hover:shadow-sm'
                  }`}>
                    <span className={`text-sm font-medium ${
                      selectedBrands.includes(brand)
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-200'
                    }`}>
                      {brand}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Özellikler */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full mr-2"></div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Özellikler</h4>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Otomatik Vites', icon: Zap, color: 'from-yellow-400 to-orange-500' },
                { name: 'Klima', icon: Snowflake, color: 'from-blue-400 to-cyan-500' },
                { name: 'GPS', icon: MapPin, color: 'from-green-400 to-emerald-500' },
                { name: 'Bluetooth', icon: Wifi, color: 'from-purple-400 to-pink-500' },
                { name: 'Güvenlik Paketi', icon: Shield, color: 'from-red-400 to-pink-500' }
              ].map((feature) => (
                <label key={feature.name} className="relative cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedFeatures.includes(feature.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFeatures([...selectedFeatures, feature.name]);
                      } else {
                        setSelectedFeatures(selectedFeatures.filter(f => f !== feature.name));
                      }
                    }}
                    className="sr-only"
                  />
                  <div className={`flex items-center p-3 rounded-xl border-2 transition-all duration-200 group-hover:scale-105 ${
                    selectedFeatures.includes(feature.name)
                      ? 'border-teal-500 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-teal-300 dark:hover:border-teal-400 hover:shadow-sm'
                  }`}>
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${feature.color} mr-3`}>
                      <feature.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className={`text-sm font-medium ${
                      selectedFeatures.includes(feature.name)
                        ? 'text-teal-700 dark:text-teal-300'
                        : 'text-gray-600 dark:text-gray-200'
                    }`}>
                      {feature.name}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Yolcu Sayısı */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full mr-2"></div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Yolcu Sayısı</h4>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[2, 4, 5, 6, 7, 8].map((count) => (
                <button
                  key={count}
                  onClick={() => setPassengerCount(passengerCount === count ? null : count)}
                  className={`relative p-3 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                    passengerCount === count
                      ? 'border-emerald-500 bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:border-emerald-300 dark:hover:border-emerald-400 hover:shadow-md'
                  }`}
                >
                  <span className="text-sm font-bold">{count}</span>
                  {passengerCount === count && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Vites Tipi */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-2 h-2 bg-gradient-to-r from-violet-400 to-purple-500 rounded-full mr-2"></div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Vites Tipi</h4>
            </div>
            <div className="space-y-3">
              {['Manuel', 'Otomatik', 'Yarı Otomatik'].map((type) => (
                <label key={type} className="relative cursor-pointer group">
                  <input
                    type="radio"
                    name="transmission"
                    value={type}
                    checked={transmissionType === type}
                    onChange={(e) => setTransmissionType(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`p-3 rounded-xl border-2 transition-all duration-200 group-hover:scale-105 ${
                    transmissionType === type
                      ? 'border-violet-500 bg-gradient-to-r from-violet-500 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-violet-300 dark:hover:border-violet-400 hover:shadow-sm'
                  }`}>
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                        transmissionType === type
                          ? 'border-violet-500 bg-violet-500'
                          : 'border-gray-300 dark:border-gray-500'
                      }`}>
                        {transmissionType === type && (
                          <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                        )}
                      </div>
                      <span className={`text-sm font-medium ${
                        transmissionType === type
                          ? 'text-violet-700 dark:text-violet-300'
                          : 'text-gray-600 dark:text-gray-200'
                      }`}>
                        {type}
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Yakıt Tipi */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-2 h-2 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full mr-2"></div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Yakıt Tipi</h4>
            </div>
            <div className="space-y-3">
              {['Benzin', 'Dizel', 'Elektrik', 'Hibrit', 'LPG'].map((type) => (
                <label key={type} className="relative cursor-pointer group">
                  <input
                    type="radio"
                    name="fuel"
                    value={type}
                    checked={fuelType === type}
                    onChange={(e) => setFuelType(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`p-3 rounded-xl border-2 transition-all duration-200 group-hover:scale-105 ${
                    fuelType === type
                      ? 'border-amber-500 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-amber-300 dark:hover:border-amber-400 hover:shadow-sm'
                  }`}>
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                        fuelType === type
                          ? 'border-amber-500 bg-amber-500'
                          : 'border-gray-300 dark:border-gray-500'
                      }`}>
                        {fuelType === type && (
                          <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                        )}
                      </div>
                      <span className={`text-sm font-medium ${
                        fuelType === type
                          ? 'text-amber-700 dark:text-amber-300'
                          : 'text-gray-600 dark:text-gray-200'
                      }`}>
                        {type}
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Filtreleri Temizle */}
          <button
            onClick={() => {
              setPriceRange([0, 1000]);
              setSelectedCategories([]);
              setSelectedBrands([]);
              setSelectedFeatures([]);
              setPassengerCount(null);
              setTransmissionType('');
              setFuelType('');
            }}
            className="w-full p-4 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
            <span>Filtreleri Temizle</span>
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default VehiclesPage;
