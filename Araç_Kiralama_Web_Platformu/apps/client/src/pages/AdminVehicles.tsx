import { useState } from 'react';
import { 
  Car, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Upload,
  X,
  MapPin,
  Fuel,
  Settings as SettingsIcon,
  Users,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  useAdminVehicles, 
  useCreateVehicle, 
  useToggleVehicleStatus,
  type Vehicle 
} from '../hooks/useVehicles';
import { useUploadMultipleImages } from '../hooks/useImageUpload';

const AdminVehicles = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Gerçek API'den veri al
  const { data, isLoading, error } = useAdminVehicles(1, 20, searchTerm, categoryFilter);
  const createVehicleMutation = useCreateVehicle();
  const toggleStatusMutation = useToggleVehicleStatus();
  const uploadImagesMutation = useUploadMultipleImages();
  
  const vehicles = data?.data?.vehicles || [];
  const stats = data?.data?.stats || { total: 0, available: 0, rented: 0, featured: 0 };

  // Seçilen resim dosyaları için state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Form state for adding new vehicle
  const [newVehicle, setNewVehicle] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    fuelType: 'GASOLINE',
    transmission: 'AUTOMATIC',
    category: 'COMPACT',
    seats: 5,
    dailyPrice: 0,
    weeklyPrice: 0,
    monthlyPrice: 0,
    description: '',
    features: [] as string[],
    images: [] as string[],
    location: '',
    isAvailable: true,
    isFeatured: false
  });

  const handleAddVehicle = async () => {
    try {
      let imageUrls: string[] = [];

      // Önce resimleri yükle
      if (selectedFiles.length > 0) {
        const uploadResult = await uploadImagesMutation.mutateAsync(selectedFiles);
        imageUrls = uploadResult.data.map((img: any) => img.fullUrl);
      }

      // Araç verisini hazırla
      const vehicleData = {
        ...newVehicle,
        images: imageUrls,
      };

      await createVehicleMutation.mutateAsync(vehicleData);
      toast.success('Araç başarıyla eklendi!');
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      toast.error('Araç eklenirken hata oluştu!');
      console.error('Create vehicle error:', error);
    }
  };

  const resetForm = () => {
    setNewVehicle({
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      fuelType: 'GASOLINE',
      transmission: 'AUTOMATIC',
      category: 'COMPACT',
      seats: 5,
      dailyPrice: 0,
      weeklyPrice: 0,
      monthlyPrice: 0,
      description: '',
      features: [],
      images: [],
      location: '',
      isAvailable: true,
      isFeatured: false
    });
    setSelectedFiles([]);
    setPreviewUrls([]);
  };

  // Resim seçme fonksiyonu
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length > 0) {
      setSelectedFiles(files);
      
      // Preview URL'leri oluştur
      const urls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  };

  // Drag & drop fonksiyonları
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      setSelectedFiles(imageFiles);
      
      const urls = imageFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  };

  const toggleVehicleStatus = async (vehicleId: string) => {
    try {
      await toggleStatusMutation.mutateAsync(vehicleId);
      toast.success('Araç durumu güncellendi!');
    } catch (error) {
      toast.error('Durum güncellenirken hata oluştu!');
      console.error('Toggle status error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-2">❌ Hata</div>
          <p className="text-gray-600">Araç verileri yüklenemedi</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Araç Yönetimi</h1>
          <p className="text-gray-600">Sistemdeki tüm araçları görüntüle ve yönet</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Yeni Araç Ekle</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Car className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Toplam Araç</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Müsait</p>
              <p className="text-2xl font-bold text-gray-900">{stats.available}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <XCircle className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Kiralık</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rented}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <SettingsIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Öne Çıkan</p>
              <p className="text-2xl font-bold text-gray-900">{stats.featured}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Araç ara (marka, model, konum)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 w-full"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 w-full appearance-none"
              >
                <option value="all">Tüm Kategoriler</option>
                <option value="COMPACT">Compact</option>
                <option value="SUV">SUV</option>
                <option value="LUXURY">Luxury</option>
                <option value="ECONOMY">Economy</option>
                <option value="SPORTS">Sports</option>
                <option value="MINIVAN">Minivan</option>
                <option value="PICKUP">Pickup</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle: Vehicle) => (
          <div key={vehicle.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="relative">
              <img 
                src={vehicle.images[0]} 
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-48 object-cover object-center"
                style={{ aspectRatio: '16/9' }}
              />
              <div className="absolute top-4 right-4 flex space-x-2">
                {vehicle.isFeatured && (
                  <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    Öne Çıkan
                  </span>
                )}
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  vehicle.isAvailable 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  {vehicle.isAvailable ? 'Müsait' : 'Kiralık'}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {vehicle.brand} {vehicle.model}
                  </h3>
                  <p className="text-sm text-gray-500">{vehicle.year} • {vehicle.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-600">
                    {vehicle.dailyPrice.toLocaleString('tr-TR')} ₺/gün
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {vehicle.seats} kişi
                </div>
                <div className="flex items-center">
                  <Fuel className="h-4 w-4 mr-1" />
                  {vehicle.fuelType}
                </div>
                <div className="flex items-center">
                  <SettingsIcon className="h-4 w-4 mr-1" />
                  {vehicle.transmission}
                </div>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {vehicle.location}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {vehicle.totalBookings} kiralama
                </div>
                <div className="flex items-center">
                  ⭐ {vehicle.averageRating} ({vehicle.totalReviews})
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedVehicle(vehicle)}
                  className="flex-1 flex items-center justify-center space-x-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  <span>Görüntüle</span>
                </button>
                <button className="flex items-center justify-center space-x-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors">
                  <Edit className="h-4 w-4" />
                  <span>Düzenle</span>
                </button>
                <button
                  onClick={() => toggleVehicleStatus(vehicle.id)}
                  className={`flex items-center justify-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                    vehicle.isAvailable
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}>
                  {vehicle.isAvailable ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {vehicles.length === 0 && (
        <div className="text-center py-12">
          <Car className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Araç bulunamadı</h3>
          <p className="mt-1 text-sm text-gray-500">Arama kriterlerinizi değiştirmeyi deneyin.</p>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowAddModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Yeni Araç Ekle</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <form className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Marka
                      </label>
                      <input
                        type="text"
                        value={newVehicle.brand}
                        onChange={(e) => setNewVehicle({...newVehicle, brand: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="BMW, Mercedes, Toyota..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Model
                      </label>
                      <input
                        type="text"
                        value={newVehicle.model}
                        onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="X5, C-Class, Corolla..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Yıl
                      </label>
                      <input
                        type="number"
                        value={newVehicle.year}
                        onChange={(e) => setNewVehicle({...newVehicle, year: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        min="2000"
                        max={new Date().getFullYear() + 1}
                      />
                    </div>
                  </div>

                  {/* Technical Specs */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Yakıt Tipi
                      </label>
                      <select
                        value={newVehicle.fuelType}
                        onChange={(e) => setNewVehicle({...newVehicle, fuelType: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="GASOLINE">Benzin</option>
                        <option value="DIESEL">Dizel</option>
                        <option value="HYBRID">Hibrit</option>
                        <option value="ELECTRIC">Elektrik</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vites Tipi
                      </label>
                      <select
                        value={newVehicle.transmission}
                        onChange={(e) => setNewVehicle({...newVehicle, transmission: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="AUTOMATIC">Otomatik</option>
                        <option value="MANUAL">Manuel</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kategori
                      </label>
                      <select
                        value={newVehicle.category}
                        onChange={(e) => setNewVehicle({...newVehicle, category: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="COMPACT">Compact</option>
                        <option value="SUV">SUV</option>
                        <option value="LUXURY">Luxury</option>
                        <option value="ECONOMY">Economy</option>
                        <option value="SPORTS">Sports</option>
                        <option value="MINIVAN">Minivan</option>
                        <option value="PICKUP">Pickup</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Koltuk Sayısı
                      </label>
                      <input
                        type="number"
                        value={newVehicle.seats}
                        onChange={(e) => setNewVehicle({...newVehicle, seats: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        min="2"
                        max="9"
                      />
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Günlük Fiyat (₺)
                      </label>
                      <input
                        type="number"
                        value={newVehicle.dailyPrice}
                        onChange={(e) => setNewVehicle({...newVehicle, dailyPrice: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Haftalık Fiyat (₺)
                      </label>
                      <input
                        type="number"
                        value={newVehicle.weeklyPrice}
                        onChange={(e) => setNewVehicle({...newVehicle, weeklyPrice: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Aylık Fiyat (₺)
                      </label>
                      <input
                        type="number"
                        value={newVehicle.monthlyPrice}
                        onChange={(e) => setNewVehicle({...newVehicle, monthlyPrice: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Açıklama
                    </label>
                    <textarea
                      value={newVehicle.description}
                      onChange={(e) => setNewVehicle({...newVehicle, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Araç hakkında detaylı bilgi..."
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Konum
                    </label>
                    <input
                      type="text"
                      value={newVehicle.location}
                      onChange={(e) => setNewVehicle({...newVehicle, location: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="İstanbul, Türkiye"
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Araç Resimleri
                    </label>
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors cursor-pointer"
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('imageInput')?.click()}
                    >
                      {selectedFiles.length > 0 ? (
                        <div>
                          <div className="grid grid-cols-3 gap-2 mb-4">
                            {previewUrls.map((url, index) => (
                              <img 
                                key={index}
                                src={url} 
                                alt={`Preview ${index + 1}`}
                                className="w-full h-20 object-cover rounded"
                              />
                            ))}
                          </div>
                          <p className="text-sm text-green-600">
                            {selectedFiles.length} resim seçildi
                          </p>
                          <p className="text-xs text-gray-500">Yeni resim seçmek için tekrar tıklayın</p>
                        </div>
                      ) : (
                        <div>
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-500">
                            Resim yüklemek için tıklayın veya sürükleyip bırakın
                          </p>
                          <p className="text-xs text-gray-400">PNG, JPG, JPEG (max. 5MB, 10 resim)</p>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      id="imageInput"
                      multiple
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </div>

                  {/* Toggles */}
                  <div className="flex space-x-6">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isAvailable"
                        checked={newVehicle.isAvailable}
                        onChange={(e) => setNewVehicle({...newVehicle, isAvailable: e.target.checked})}
                        className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <label htmlFor="isAvailable" className="ml-2 text-sm text-gray-700">
                        Müsait
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isFeatured"
                        checked={newVehicle.isFeatured}
                        onChange={(e) => setNewVehicle({...newVehicle, isFeatured: e.target.checked})}
                        className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <label htmlFor="isFeatured" className="ml-2 text-sm text-gray-700">
                        Öne Çıkar
                      </label>
                    </div>
                  </div>
                </form>
              </div>

              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleAddVehicle}
                    disabled={createVehicleMutation.isPending || uploadImagesMutation.isPending}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {(createVehicleMutation.isPending || uploadImagesMutation.isPending) && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    <span>
                      {uploadImagesMutation.isPending 
                        ? 'Resimler yükleniyor...' 
                        : createVehicleMutation.isPending 
                        ? 'Kaydediliyor...' 
                        : 'Araç Ekle'
                      }
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVehicles;
