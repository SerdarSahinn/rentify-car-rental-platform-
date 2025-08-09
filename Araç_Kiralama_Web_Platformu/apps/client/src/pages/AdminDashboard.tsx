import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { 
  Calendar, 
  Car, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Eye,
  MessageSquare,
  FileText,
  X
} from 'lucide-react';
import { getAllBookings, updateBookingStatus } from '../services/bookingApi';

interface Booking {
  id: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  status: string;
  notes?: string;
  createdAt: string;
  vehicle?: {
    brand: string;
    model: string;
    year: number;
  };
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
}

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user, isSignedIn } = useUser();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'bookings' | 'forms' | 'messages' | 'approved' | 'vehicles'>('bookings');
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Vehicle management states
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Admin kontrolü - sadece admin@rentify.com giriş yapabilir
  useEffect(() => {
    if (isSignedIn && user?.emailAddresses[0]?.emailAddress !== 'admin@rentify.com') {
      navigate('/admin/login');
    } else if (!isSignedIn) {
      navigate('/admin/login');
    }
  }, [isSignedIn, user, navigate]);

  // Eğer admin değilse loading göster
  if (!isSignedIn || user?.emailAddresses[0]?.emailAddress !== 'admin@rentify.com') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yönlendiriliyor...</p>
        </div>
      </div>
    );
  }

  // Tüm kiralamaları getir
  const { data: bookingsResponse, isLoading, error } = useQuery({
    queryKey: ['adminBookings'],
    queryFn: getAllBookings,
  });

  // Tüm formları getir
  const { data: formsResponse, isLoading: formsLoading } = useQuery({
    queryKey: ['adminForms'],
    queryFn: async () => {
      console.log('🔍 Form API çağrılıyor...');
      const response = await fetch('http://localhost:3001/api/forms', {
        headers: {
          'Authorization': `Bearer ${await window.Clerk?.session?.getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('🔍 Form API response status:', response.status);
      const data = await response.json();
      console.log('🔍 Form API response data:', data);
      return data;
    },
    enabled: true // Her zaman çalışsın
  });

  // Tüm araçları getir
  const { data: vehiclesResponse, isLoading: vehiclesLoading } = useQuery({
    queryKey: ['adminVehicles'],
    queryFn: async () => {
      console.log('🔍 Vehicles API çağrılıyor...');
      const response = await fetch('http://localhost:3001/api/vehicles?limit=100');
      console.log('🔍 Vehicles API response status:', response.status);
      const data = await response.json();
      console.log('🔍 Vehicles API response data:', data);
      return data;
    },
    enabled: true // Her zaman çalışsın
  });

  // Response yapısını kontrol et ve düzelt
  let bookings: Booking[] = [];
  let vehicles: any[] = [];
  
  if (bookingsResponse) {
    // Eğer response.data varsa onu kullan, yoksa direkt response'u kullan
    bookings = (bookingsResponse.data || bookingsResponse || []) as Booking[];
  }

  if (vehiclesResponse) {
    // Vehicles API response'unu işle
    vehicles = (vehiclesResponse.data || vehiclesResponse || []) as any[];
  }

  // Debug logs - detaylı
  console.log('🔍 Admin Dashboard Debug:');
  console.log('🔍 bookingsResponse:', bookingsResponse);
  console.log('🔍 bookingsResponse?.data:', bookingsResponse?.data);
  console.log('🔍 bookings array:', bookings);
  console.log('🔍 bookings length:', bookings.length);
  console.log('🔍 bookingsResponse type:', typeof bookingsResponse);
  console.log('🔍 bookingsResponse?.data type:', typeof bookingsResponse?.data);

  // Kiralama durumunu güncelle
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateBookingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBookings'] });
      queryClient.invalidateQueries({ queryKey: ['userBookings'] });
    },
  });

  // Araç silme mutation
  const deleteVehicleMutation = useMutation({
    mutationFn: async (vehicleId: string) => {
      const token = await window.Clerk?.session?.getToken();
      const response = await fetch(`http://localhost:3001/api/vehicles/${vehicleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Araç silinirken hata oluştu');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminVehicles'] });
      alert('✅ Araç başarıyla silindi!');
    },
    onError: (error) => {
      console.error('Araç silme hatası:', error);
      alert('❌ Araç silinirken hata oluştu!');
    }
  });

  // Araç güncelleme mutation
  const updateVehicleMutation = useMutation({
    mutationFn: async ({ vehicleId, data }: { vehicleId: string; data: any }) => {
      const token = await window.Clerk?.session?.getToken();
      const response = await fetch(`http://localhost:3001/api/vehicles/${vehicleId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Araç güncellenirken hata oluştu');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminVehicles'] });
      setShowEditModal(false);
      setSelectedVehicle(null);
      alert('✅ Araç başarıyla güncellendi!');
    },
    onError: (error) => {
      console.error('Araç güncelleme hatası:', error);
      alert('❌ Araç güncellenirken hata oluştu!');
    }
  });

  // Yeni araç ekleme mutation
  const createVehicleMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = await window.Clerk?.session?.getToken();
      const response = await fetch(`http://localhost:3001/api/vehicles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Araç eklenirken hata oluştu');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminVehicles'] });
      setShowAddModal(false);
      alert('✅ Araç başarıyla eklendi!');
    },
    onError: (error) => {
      console.error('Araç ekleme hatası:', error);
      alert('❌ Araç eklenirken hata oluştu!');
    }
  });

  // Helper functions
  const handleDeleteVehicle = (vehicle: any) => {
    if (window.confirm(`"${vehicle.brand} ${vehicle.model}" aracını silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz ve araç veritabanından tamamen silinecektir.`)) {
      setIsDeleting(true);
      deleteVehicleMutation.mutate(vehicle.id, {
        onSettled: () => setIsDeleting(false)
      });
    }
  };

  const handleEditVehicle = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setShowEditModal(true);
  };

  // Durum filtreleme
  const filteredBookings = bookings.filter((booking: Booking) => {
    if (selectedStatus === 'all') return true;
    return booking.status === selectedStatus;
  });

  // İstatistikler
  const stats = {
    total: bookings.length,
    pending: bookings.filter((b: Booking) => b.status === 'PENDING').length,
    confirmed: bookings.filter((b: Booking) => b.status === 'CONFIRMED').length,
    formRequired: bookings.filter((b: Booking) => b.status === 'FORM_REQUIRED').length,
    formPending: bookings.filter((b: Booking) => b.status === 'FORM_PENDING').length,
    cancelled: bookings.filter((b: Booking) => b.status === 'CANCELLED').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'FORM_REQUIRED': return 'bg-orange-100 text-orange-800';
      case 'FORM_PENDING': return 'bg-purple-100 text-purple-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'CONFIRMED': return <CheckCircle className="w-4 h-4" />;
      case 'FORM_REQUIRED': return <FileText className="w-4 h-4" />;
      case 'FORM_PENDING': return <AlertCircle className="w-4 h-4" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Bekliyor';
      case 'CONFIRMED': return 'Onaylandı';
      case 'FORM_REQUIRED': return 'Form İstendi';
      case 'FORM_PENDING': return 'Form Bekliyor';
      case 'CANCELLED': return 'İptal Edildi';
      default: return status;
    }
  };

  const handleStatusUpdate = (bookingId: string, newStatus: string) => {
    updateStatusMutation.mutate({ id: bookingId, status: newStatus });
  };

  const handleFormApproval = async (formId: string, isApproved: boolean, rejectionReason: string = '') => {
    try {
      const response = await fetch(`http://localhost:3001/api/forms/${formId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${await window.Clerk?.session?.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isApproved,
          isRejected: !isApproved,
          rejectionReason: isApproved ? '' : rejectionReason
        })
      });

      if (response.ok) {
        // Form listesini yenile
        queryClient.invalidateQueries({ queryKey: ['adminForms'] });
        queryClient.invalidateQueries({ queryKey: ['adminBookings'] });
        
        // Modal'ı kapat
        setShowFormModal(false);
        setSelectedForm(null);
        setRejectionReason('');
        
        alert(isApproved ? 'Form onaylandı! Kullanıcıya bildirim gönderildi.' : 'Form reddedildi! Kullanıcıya bildirim gönderildi.');
      } else {
        alert('Form güncellenirken hata oluştu!');
      }
    } catch (error) {
      console.error('Form onaylama hatası:', error);
      alert('Form onaylanırken hata oluştu!');
    }
  };

  const renderFormsContent = () => {
    console.log('🔍 renderFormsContent çağrıldı');
    console.log('🔍 formsResponse:', formsResponse);
    console.log('🔍 formsLoading:', formsLoading);
    
    const forms = formsResponse?.data || [];
    console.log('🔍 forms array:', forms);
    console.log('🔍 forms length:', forms.length);

    if (formsLoading) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Formlar yükleniyor...</p>
        </div>
      );
    }

    if (forms.length === 0) {
      return (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Henüz form gönderilmedi.</p>
          <p className="text-sm text-gray-400 mt-2">Kullanıcılar form doldurduğunda burada görünecek.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {forms.map((form: any) => (
          <div key={form.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {form.booking?.vehicle?.brand} {form.booking?.vehicle?.model}
                </h3>
                <p className="text-sm text-gray-500">
                  Kullanıcı: {form.user?.email || 'Bilinmiyor'}
                </p>
                <p className="text-sm text-gray-500">
                  Tarih: {new Date(form.createdAt).toLocaleDateString('tr-TR')}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedForm(form);
                    setShowFormModal(true);
                  }}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  <Eye className="h-4 w-4 inline mr-1" />
                  Formu Görüntüle
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>TC Kimlik:</strong> {form.tcNumber}
              </div>
              <div>
                <strong>Sürücü Belgesi:</strong> {form.driverLicense}
              </div>
              <div>
                <strong>Telefon:</strong> {form.phoneNumber}
              </div>
              <div>
                <strong>Adres:</strong> {form.address}
              </div>
              <div className="col-span-2">
                <strong>Acil Durum İletişim:</strong> {form.emergencyContact}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };



  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Car className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Kiralama Yönetimi</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Admin: {user?.emailAddresses[0]?.emailAddress}
              </span>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Ana Sayfaya Dön
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('bookings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'bookings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Kiralama Talepleri ({stats.total})</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('forms')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'forms'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Gelen Formlar ({stats.formPending})</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('approved')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'approved'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Onaylanan Kiralar ({bookings.filter(b => b.status === 'CONFIRMED').length})</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('messages')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'messages'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Bildirimler</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('vehicles')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'vehicles'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Car className="h-5 w-5" />
                  <span>Araçlar</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* Filtreler */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedStatus('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      selectedStatus === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Tümü ({stats.total})
                  </button>
                  <button
                    onClick={() => setSelectedStatus('PENDING')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      selectedStatus === 'PENDING'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Bekliyor ({stats.pending})
                  </button>
                  <button
                    onClick={() => setSelectedStatus('FORM_REQUIRED')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      selectedStatus === 'FORM_REQUIRED'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Form İstendi ({stats.formRequired})
                  </button>
                  <button
                    onClick={() => setSelectedStatus('FORM_PENDING')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      selectedStatus === 'FORM_PENDING'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Form Bekliyor ({stats.formPending})
                  </button>
                </div>
              </div>
            </div>

            {/* Kiralama Listesi */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Kiralama İstekleri</h2>
                
                {filteredBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Bu durumda kiralama bulunamadı.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredBookings.map((booking: Booking) => (
                      <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Car className="h-6 w-6 text-gray-500" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {booking.vehicle?.brand} {booking.vehicle?.model} ({booking.vehicle?.year})
                              </h3>
                              <p className="text-sm text-gray-500">
                                {new Date(booking.startDate).toLocaleDateString('tr-TR')} - {new Date(booking.endDate).toLocaleDateString('tr-TR')}
                              </p>
                              <p className="text-sm text-gray-500">
                                {booking.totalDays} gün • ₺{booking.totalPrice}
                              </p>
                              {booking.user && (
                                <div className="mt-2 p-2 bg-blue-50 rounded">
                                  <p className="text-xs text-blue-600">
                                    <strong>📧 Kullanıcı:</strong> {booking.user.email}
                                  </p>
                                  {booking.user.phone && (
                                    <p className="text-xs text-blue-600">
                                      <strong>📞 Tel:</strong> {booking.user.phone}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(booking.status)}`}>
                              {getStatusIcon(booking.status)}
                              <span>{getStatusText(booking.status)}</span>
                            </span>

                            <div className="flex space-x-2">
                              {booking.status === 'PENDING' && (
                                <>
                                  <button
                                    onClick={() => handleStatusUpdate(booking.id, 'FORM_REQUIRED')}
                                    disabled={updateStatusMutation.isPending}
                                    className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 disabled:opacity-50"
                                  >
                                    Form Gönder
                                  </button>
                                  
                                  <button
                                    onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
                                    disabled={updateStatusMutation.isPending}
                                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                                  >
                                    İşlem Olumsuz
                                  </button>
                                </>
                              )}
                              
                              {booking.status === 'FORM_REQUIRED' && (
                                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded text-sm">
                                  Form Gönderildi
                                </span>
                              )}
                              
                              {booking.status === 'FORM_PENDING' && (
                                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                                  Form Bekliyor
                                </span>
                              )}
                              
                              {booking.status === 'CONFIRMED' && (
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">
                                  Onaylandı
                                </span>
                              )}
                              
                              {booking.status === 'CANCELLED' && (
                                <span className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm">
                                  İptal Edildi
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {booking.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded">
                            <p className="text-sm text-gray-600">
                              <strong>Not:</strong> {booking.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'forms' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Bekleyen Formlar</h2>
              
              {/* Form içeriği */}
              {renderFormsContent()}
            </div>
          </div>
        )}

        {activeTab === 'approved' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Onaylanan Kiralar</h2>
              <div className="space-y-4">
                {bookings.filter(b => b.status === 'CONFIRMED').length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Henüz onaylanan kiralama yok.</p>
                    <p className="text-sm text-gray-400 mt-2">Formlar onaylandığında burada görünecek.</p>
                  </div>
                ) : (
                  bookings.filter(b => b.status === 'CONFIRMED').map((booking) => (
                    <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Car className="h-5 w-5 text-green-600" />
                            <h3 className="font-semibold text-gray-900">
                              {booking.vehicle?.brand} {booking.vehicle?.model}
                            </h3>
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              Onaylandı
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <strong>Kullanıcı:</strong> {booking.user?.email}
                            </div>
                            <div>
                              <strong>Tarih:</strong> {new Date(booking.startDate).toLocaleDateString('tr-TR')} - {new Date(booking.endDate).toLocaleDateString('tr-TR')}
                            </div>
                            <div>
                              <strong>Gün:</strong> {booking.totalDays}
                            </div>
                            <div>
                              <strong>Ücret:</strong> ₺{booking.totalPrice}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Mesaj Yönetimi</h2>
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Mesaj sistemi yakında eklenecek.</p>
                <p className="text-sm text-gray-400 mt-2">Kullanıcılara otomatik mesaj gönderme özelliği.</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Detay Modal'ı */}
        {showFormModal && selectedForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Form Detayları - {selectedForm.booking?.vehicle?.brand} {selectedForm.booking?.vehicle?.model}
                </h2>
                <button
                  onClick={() => setShowFormModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Kullanıcı Bilgileri */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Kullanıcı Bilgileri</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Email:</strong> {selectedForm.user?.email}</div>
                    <div><strong>TC Kimlik:</strong> {selectedForm.tcNumber}</div>
                    <div><strong>Telefon:</strong> {selectedForm.phoneNumber}</div>
                    <div><strong>Sürücü Belgesi:</strong> {selectedForm.driverLicense}</div>
                    <div><strong>Belge Geçerlilik:</strong> {selectedForm.licenseExpiry ? new Date(selectedForm.licenseExpiry).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}</div>
                  </div>
                </div>

                {/* Adres Bilgileri */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Adres Bilgileri</h3>
                  <p className="text-sm"><strong>Adres:</strong> {selectedForm.address}</p>
                  <p className="text-sm"><strong>Acil Durum İletişim:</strong> {selectedForm.emergencyContact}</p>
                </div>

                {/* Kiralama Bilgileri */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Kiralama Bilgileri</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Araç:</strong> {selectedForm.booking?.vehicle?.brand} {selectedForm.booking?.vehicle?.model}</div>
                    <div><strong>Tarih:</strong> {selectedForm.booking?.startDate ? new Date(selectedForm.booking.startDate).toLocaleDateString('tr-TR') : 'Belirtilmemiş'} - {selectedForm.booking?.endDate ? new Date(selectedForm.booking.endDate).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}</div>
                    <div><strong>Toplam Gün:</strong> {selectedForm.booking?.totalDays}</div>
                    <div><strong>Toplam Ücret:</strong> ₺{selectedForm.booking?.totalPrice}</div>
                  </div>
                </div>

                {/* Onay/Red Butonları */}
                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={() => handleFormApproval(selectedForm.id, true)}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                  >
                    ✅ Onayla
                  </button>
                  <button
                    onClick={() => setRejectionReason('Red nedeni girin...')}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
                  >
                    ❌ Reddet
                  </button>
                </div>

                {/* Red Nedeni */}
                {rejectionReason && rejectionReason !== '' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Red Nedeni:
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      rows={3}
                      placeholder="Red nedenini yazın..."
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleFormApproval(selectedForm.id, false, rejectionReason)}
                        className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
                      >
                        Reddet ve Gönder
                      </button>
                      <button
                        onClick={() => setRejectionReason('')}
                        className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Araçlar Yönetimi */}
        {activeTab === 'vehicles' && (
          <div className="space-y-6">
            {/* Üst Kısım - İstatistikler ve Yeni Araç Butonu */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Araç Yönetimi</h2>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <Car className="h-4 w-4" />
                    <span>Yeni Araç Ekle</span>
                  </button>
                </div>
              </div>
              
              {/* İstatistik Kartları */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Car className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Toplam Araç</p>
                      <p className="text-2xl font-bold text-gray-900">{vehicles.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Aktif Araç</p>
                      <p className="text-2xl font-bold text-gray-900">{vehicles.filter(v => v.isAvailable).length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-yellow-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Kiralanan</p>
                      <p className="text-2xl font-bold text-gray-900">{vehicles.filter(v => !v.isAvailable).length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <XCircle className="h-8 w-8 text-red-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Öne Çıkan</p>
                      <p className="text-2xl font-bold text-gray-900">{vehicles.filter(v => v.isFeatured).length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Araçlar Tablosu */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Mevcut Araçlar</h3>
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      placeholder="Araç ara..."
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                    <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                      <option value="">Tüm Markalar</option>
                      <option value="BMW">BMW</option>
                      <option value="Mercedes">Mercedes</option>
                      <option value="Audi">Audi</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Araç
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kategori
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fiyat
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vehiclesLoading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                          Araçlar yükleniyor...
                        </td>
                      </tr>
                    ) : vehicles.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                          Henüz araç bulunmuyor.
                        </td>
                      </tr>
                    ) : (
                      vehicles.map((vehicle, index) => {
                        // Images'ı parse et
                        let images = [];
                        try {
                          images = typeof vehicle.images === 'string' ? JSON.parse(vehicle.images) : vehicle.images || [];
                        } catch (e) {
                          images = [];
                        }
                        
                        const firstImage = images[0] || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=300';
                        
                        return (
                          <tr key={vehicle.id || index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-16 w-16 flex-shrink-0">
                                  <img 
                                    className="h-16 w-16 rounded-lg object-cover" 
                                    src={firstImage} 
                                    alt={`${vehicle.brand} ${vehicle.model}`}
                                    onError={(e) => {
                                      e.currentTarget.src = 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=300';
                                    }}
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {vehicle.brand} {vehicle.model}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {vehicle.year} • {vehicle.transmission} • {vehicle.seats} Koltuk
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                vehicle.category === 'Lüks' ? 'bg-blue-100 text-blue-800' :
                                vehicle.category === 'Premium' ? 'bg-purple-100 text-purple-800' :
                                vehicle.category === 'Ekonomik' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {vehicle.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ₺{vehicle.dailyPrice?.toFixed(2)}/gün
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                vehicle.isAvailable 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {vehicle.isAvailable ? 'Aktif' : 'Kiralanan'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button 
                                onClick={() => handleEditVehicle(vehicle)}
                                className="text-blue-600 hover:text-blue-900 mr-3 disabled:opacity-50"
                                disabled={updateVehicleMutation.isPending}
                              >
                                {updateVehicleMutation.isPending && selectedVehicle?.id === vehicle.id ? 'Güncelleniyor...' : 'Düzenle'}
                              </button>
                              <button 
                                onClick={() => handleDeleteVehicle(vehicle)}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                disabled={deleteVehicleMutation.isPending || isDeleting}
                              >
                                {deleteVehicleMutation.isPending && isDeleting ? 'Siliniyor...' : 'Sil'}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Vehicle Modal */}
      {showEditModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Araç Düzenle</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedVehicle(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <EditVehicleForm 
              vehicle={selectedVehicle}
              onSubmit={(data) => {
                updateVehicleMutation.mutate({ 
                  vehicleId: selectedVehicle.id, 
                  data 
                });
              }}
              onCancel={() => {
                setShowEditModal(false);
                setSelectedVehicle(null);
              }}
              isLoading={updateVehicleMutation.isPending}
            />
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Yeni Araç Ekle</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <AddVehicleForm 
              onSubmit={(data) => {
                createVehicleMutation.mutate(data);
              }}
              onCancel={() => setShowAddModal(false)}
              isLoading={createVehicleMutation.isPending}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// EditVehicleForm Component
const EditVehicleForm = ({ vehicle, onSubmit, onCancel, isLoading }: {
  vehicle: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}) => {
  const [formData, setFormData] = useState({
    brand: vehicle.brand || '',
    model: vehicle.model || '',
    year: vehicle.year || 2024,
    category: vehicle.category || '',
    fuelType: vehicle.fuelType || '',
    transmission: vehicle.transmission || '',
    seats: vehicle.seats || 5,
    dailyPrice: vehicle.dailyPrice || 0,
    weeklyPrice: vehicle.weeklyPrice || 0,
    monthlyPrice: vehicle.monthlyPrice || 0,
    description: vehicle.description || '',
    location: vehicle.location || '',
    isAvailable: vehicle.isAvailable ?? true,
    isFeatured: vehicle.isFeatured ?? false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Sayısal değerleri number'a çevir
    const submitData = {
      ...formData,
      year: Number(formData.year),
      seats: Number(formData.seats),
      dailyPrice: Number(formData.dailyPrice),
      weeklyPrice: formData.weeklyPrice ? Number(formData.weeklyPrice) : null,
      monthlyPrice: formData.monthlyPrice ? Number(formData.monthlyPrice) : null,
    };
    
    onSubmit(submitData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Marka</label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Yıl</label>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleInputChange}
            min="2000"
            max="2030"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          >
            <option value="">Seçin</option>
            <option value="Ekonomik">Ekonomik</option>
            <option value="Orta">Orta</option>
            <option value="Lüks">Lüks</option>
            <option value="Premium">Premium</option>
            <option value="SUV">SUV</option>
            <option value="Minivan">Minivan</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Koltuk</label>
          <input
            type="number"
            name="seats"
            value={formData.seats}
            onChange={handleInputChange}
            min="2"
            max="9"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Yakıt Türü</label>
          <select
            name="fuelType"
            value={formData.fuelType}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          >
            <option value="">Seçin</option>
            <option value="Benzin">Benzin</option>
            <option value="Dizel">Dizel</option>
            <option value="Elektrik">Elektrik</option>
            <option value="Hibrit">Hibrit</option>
            <option value="LPG">LPG</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vites</label>
          <select
            name="transmission"
            value={formData.transmission}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          >
            <option value="">Seçin</option>
            <option value="Manuel">Manuel</option>
            <option value="Otomatik">Otomatik</option>
            <option value="Yarı Otomatik">Yarı Otomatik</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Günlük Fiyat (₺)</label>
          <input
            type="number"
            name="dailyPrice"
            value={formData.dailyPrice}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Haftalık Fiyat (₺)</label>
          <input
            type="number"
            name="weeklyPrice"
            value={formData.weeklyPrice}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Aylık Fiyat (₺)</label>
          <input
            type="number"
            name="monthlyPrice"
            value={formData.monthlyPrice}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Lokasyon</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder="İstanbul, Türkiye"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder="Araç hakkında açıklama..."
        />
      </div>

      <div className="flex items-center space-x-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            name="isAvailable"
            checked={formData.isAvailable}
            onChange={handleInputChange}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">Kiralama için müsait</span>
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            name="isFeatured"
            checked={formData.isFeatured}
            onChange={handleInputChange}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">Öne çıkan araç</span>
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          disabled={isLoading}
        >
          İptal
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Güncelleniyor...' : 'Güncelle'}
        </button>
      </div>
    </form>
  );
};

// AddVehicleForm Component
const AddVehicleForm = ({ onSubmit, onCancel, isLoading }: {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}) => {
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: 2024,
    category: '',
    fuelType: '',
    transmission: '',
    seats: 5,
    dailyPrice: 0,
    weeklyPrice: 0,
    monthlyPrice: 0,
    description: '',
    location: 'İstanbul, Türkiye',
    isAvailable: true,
    isFeatured: false,
    features: ['Klima', 'ABS', 'Airbag'],
    images: []
  });
  
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Resimleri base64'e çevir
    const imageUrls: string[] = [];
    for (const file of imageFiles) {
      try {
        const base64 = await convertToBase64(file);
        imageUrls.push(base64);
      } catch (error) {
        console.error('Resim yükleme hatası:', error);
        alert('Resim yüklenirken hata oluştu!');
        return;
      }
    }
    
    // Sayısal değerleri number'a çevir
    const submitData = {
      ...formData,
      year: Number(formData.year),
      seats: Number(formData.seats),
      dailyPrice: Number(formData.dailyPrice),
      weeklyPrice: formData.weeklyPrice ? Number(formData.weeklyPrice) : null,
      monthlyPrice: formData.monthlyPrice ? Number(formData.monthlyPrice) : null,
      images: imageUrls // Resimleri ekle
    };
    
    onSubmit(submitData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Dosya sayısı kontrolü (maksimum 5 resim)
    if (imageFiles.length + files.length > 5) {
      alert('Maksimum 5 resim yükleyebilirsiniz!');
      return;
    }
    
    // Dosya türü kontrolü
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      alert('Sadece JPG, JPEG, PNG ve WebP formatlarında resim yükleyebilirsiniz!');
      return;
    }
    
    // Dosya boyutu kontrolü (maksimum 5MB per resim)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert('Her resim maksimum 5MB olabilir!');
      return;
    }
    
    // Dosyaları ekle
    setImageFiles(prev => [...prev, ...files]);
    
    // Preview URL'lerini oluştur
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Marka *</label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder="BMW, Mercedes, Audi..."
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder="3 Series, C-Class, A4..."
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Yıl *</label>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleInputChange}
            min="2000"
            max="2030"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          >
            <option value="">Seçin</option>
            <option value="Ekonomik">Ekonomik</option>
            <option value="Orta">Orta</option>
            <option value="Lüks">Lüks</option>
            <option value="Premium">Premium</option>
            <option value="SUV">SUV</option>
            <option value="Minivan">Minivan</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Koltuk *</label>
          <input
            type="number"
            name="seats"
            value={formData.seats}
            onChange={handleInputChange}
            min="2"
            max="9"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Yakıt Türü *</label>
          <select
            name="fuelType"
            value={formData.fuelType}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          >
            <option value="">Seçin</option>
            <option value="Benzin">Benzin</option>
            <option value="Dizel">Dizel</option>
            <option value="Elektrik">Elektrik</option>
            <option value="Hibrit">Hibrit</option>
            <option value="LPG">LPG</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vites *</label>
          <select
            name="transmission"
            value={formData.transmission}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          >
            <option value="">Seçin</option>
            <option value="Manuel">Manuel</option>
            <option value="Otomatik">Otomatik</option>
            <option value="Yarı Otomatik">Yarı Otomatik</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Günlük Fiyat (₺) *</label>
          <input
            type="number"
            name="dailyPrice"
            value={formData.dailyPrice}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder="250.00"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Haftalık Fiyat (₺)</label>
          <input
            type="number"
            name="weeklyPrice"
            value={formData.weeklyPrice}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder="1500.00"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Aylık Fiyat (₺)</label>
          <input
            type="number"
            name="monthlyPrice"
            value={formData.monthlyPrice}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder="6000.00"
          />
        </div>
      </div>

      {/* Resim Yükleme Alanı */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Araç Resimleri</label>
        <div className="space-y-3">
          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-gray-400">📷</div>
              <div className="mt-2">
                <label htmlFor="image-upload" className="cursor-pointer">
                  <span className="text-sm text-blue-600 hover:text-blue-500">
                    Resim seç
                  </span>
                  <input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageUpload}
                    className="sr-only"
                  />
                </label>
                <span className="text-sm text-gray-500"> veya sürükle bırak</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG, WebP formatları • Maksimum 5 resim • Her biri 5MB'dan küçük
              </p>
            </div>
          </div>

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      Ana resim
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Lokasyon</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder="İstanbul, Türkiye"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder="Araç hakkında detaylı açıklama yazın..."
        />
      </div>

      <div className="flex items-center space-x-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            name="isAvailable"
            checked={formData.isAvailable}
            onChange={handleInputChange}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">Kiralama için müsait</span>
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            name="isFeatured"
            checked={formData.isFeatured}
            onChange={handleInputChange}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">Öne çıkan araç</span>
        </label>
      </div>



      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          disabled={isLoading}
        >
          İptal
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Ekleniyor...' : 'Araç Ekle'}
        </button>
      </div>
    </form>
  );
};

export default AdminDashboard;


