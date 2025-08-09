import { useState } from 'react';
import { 
  Calendar, 
  Search, 
  Filter, 
  Eye, 
  Check, 
  X, 
  Clock, 
  Car, 
  User,
  MapPin,
  CreditCard,
  Phone,
  Mail
} from 'lucide-react';
import { useAdminBookings, useUpdateBookingStatus, type Booking } from '../hooks/useAdminData';
import toast from 'react-hot-toast';

const AdminBookings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Gerçek API'den veri al
  const { data, isLoading, error } = useAdminBookings(1, 50, searchTerm, statusFilter);
  const updateStatusMutation = useUpdateBookingStatus();
  
  const bookings = data?.data?.bookings || [];
  const stats = data?.data?.stats || { 
    total: 0, 
    pending: 0, 
    confirmed: 0, 
    active: 0, 
    completed: 0, 
    cancelled: 0, 
    totalRevenue: 0 
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({ bookingId, status: newStatus });
      toast.success('Rezervasyon durumu güncellendi!');
    } catch (error) {
      toast.error('Durum güncellenirken hata oluştu!');
      console.error('Status update error:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Beklemede';
      case 'CONFIRMED': return 'Onaylandı';
      case 'ACTIVE': return 'Aktif';
      case 'COMPLETED': return 'Tamamlandı';
      case 'CANCELLED': return 'İptal';
      default: return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Beklemede';
      case 'PAID': return 'Ödendi';
      case 'FAILED': return 'Başarısız';
      default: return status;
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
          <p className="text-gray-600">Rezervasyon verileri yüklenemedi</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rezervasyon Yönetimi</h1>
          <p className="text-gray-600">Tüm rezervasyonları görüntüle ve yönet</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Toplam</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Beklemede</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Check className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Onaylı</p>
              <p className="text-2xl font-bold text-gray-900">{stats.confirmed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Car className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Aktif</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Gelir</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRevenue.toLocaleString('tr-TR')} ₺</p>
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
                placeholder="Rezervasyon ara (numara, kullanıcı, araç)..."
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 w-full appearance-none"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="PENDING">Beklemede</option>
                <option value="CONFIRMED">Onaylandı</option>
                <option value="ACTIVE">Aktif</option>
                <option value="COMPLETED">Tamamlandı</option>
                <option value="CANCELLED">İptal</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Rezervasyon Listesi ({bookings.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rezervasyon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Müşteri
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Araç
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarihler
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tutar
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
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {booking.bookingNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(booking.createdAt).toLocaleDateString('tr-TR')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.user.name}
                        </div>
                        <div className="text-sm text-gray-500">{booking.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img 
                        src={booking.vehicle.image} 
                        alt={`${booking.vehicle.brand} ${booking.vehicle.model}`}
                        className="h-10 w-16 object-cover rounded"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.vehicle.brand} {booking.vehicle.model}
                        </div>
                        <div className="text-sm text-gray-500">{booking.vehicle.year}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>{new Date(booking.startDate).toLocaleDateString('tr-TR')}</div>
                      <div className="text-gray-500">
                        {new Date(booking.endDate).toLocaleDateString('tr-TR')}
                      </div>
                      <div className="text-xs text-gray-400">{booking.totalDays} gün</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.totalPrice.toLocaleString('tr-TR')} ₺
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
                      {getPaymentStatusText(booking.paymentStatus)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {booking.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}
                          className="text-red-600 hover:text-red-900"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setSelectedBooking(null)}></div>
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Rezervasyon Detayı - {selectedBooking.bookingNumber}
                </h3>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Müşteri Bilgileri</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{selectedBooking.user.name}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{selectedBooking.user.email}</span>
                    </div>
                    {selectedBooking.user.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <span>{selectedBooking.user.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Araç Bilgileri</h4>
                  <div className="space-y-2">
                    <img 
                      src={selectedBooking.vehicle.image} 
                      alt={`${selectedBooking.vehicle.brand} ${selectedBooking.vehicle.model}`}
                      className="w-full h-32 object-cover rounded"
                    />
                    <p className="font-medium">
                      {selectedBooking.vehicle.brand} {selectedBooking.vehicle.model} ({selectedBooking.vehicle.year})
                    </p>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <h4 className="font-semibold text-gray-900 mb-4">Rezervasyon Detayları</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Başlangıç Tarihi</p>
                      <p className="font-medium">{new Date(selectedBooking.startDate).toLocaleDateString('tr-TR')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Bitiş Tarihi</p>
                      <p className="font-medium">{new Date(selectedBooking.endDate).toLocaleDateString('tr-TR')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Toplam Gün</p>
                      <p className="font-medium">{selectedBooking.totalDays} gün</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Toplam Tutar</p>
                      <p className="font-medium">{selectedBooking.totalPrice.toLocaleString('tr-TR')} ₺</p>
                    </div>
                  </div>
                  
                  {selectedBooking.pickupLocation && (
                    <div className="mt-4">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-500">Teslim Alma Yeri:</span>
                        <span className="ml-2 font-medium">{selectedBooking.pickupLocation}</span>
                      </div>
                    </div>
                  )}
                  
                  {selectedBooking.notes && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">Notlar:</p>
                      <p className="mt-1 text-sm bg-gray-50 p-3 rounded">{selectedBooking.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
