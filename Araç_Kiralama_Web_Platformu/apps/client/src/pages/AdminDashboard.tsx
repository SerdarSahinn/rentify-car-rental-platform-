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
  const [activeTab, setActiveTab] = useState<'bookings' | 'forms' | 'messages' | 'approved'>('bookings');
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

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

  // Response yapısını kontrol et ve düzelt
  let bookings: Booking[] = [];
  
  if (bookingsResponse) {
    // Eğer response.data varsa onu kullan, yoksa direkt response'u kullan
    bookings = (bookingsResponse.data || bookingsResponse || []) as Booking[];
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
      </div>
    </div>
  );
};

export default AdminDashboard;


