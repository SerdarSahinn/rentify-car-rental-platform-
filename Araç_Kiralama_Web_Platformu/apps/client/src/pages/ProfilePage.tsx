import { useUser } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { User, Car, Calendar, Star, MessageSquare, FileText, CheckCircle } from 'lucide-react';
import { getUserBookings } from '../services/bookingApi';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, isSignedIn } = useUser();
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'messages' | 'forms'>('overview');
  const navigate = useNavigate();

  // Admin kontrolü - admin ise dashboard'a yönlendir
  useEffect(() => {
    if (isSignedIn && user?.emailAddresses[0]?.emailAddress === 'admin@rentify.com') {
      navigate('/admin');
    }
  }, [isSignedIn, user, navigate]);

  // Notifications API'si ekle
  const { data: notificationsResponse, isLoading: notificationsLoading, error: notificationsError } = useQuery({
    queryKey: ['userNotifications', user?.emailAddresses[0]?.emailAddress],
    queryFn: async () => {
      console.log('🔍 Notification API çağrılıyor...');
      console.log('🔍 Kullanıcı email:', user?.emailAddresses[0]?.emailAddress);
      
      // Token kontrolü
      const token = await window.Clerk?.session?.getToken();
      if (!token) {
        console.log('❌ Token bulunamadı!');
        return { data: [] };
      }
      
      console.log('✅ Token alındı:', token.substring(0, 20) + '...');
      
      const response = await fetch('http://localhost:3001/api/notifications/user', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userEmail: user?.emailAddresses[0]?.emailAddress
        })
      });
      console.log('🔍 Response status:', response.status);
      const data = await response.json();
      console.log('🔍 Response data:', data);
      return data;
    },
    enabled: isSignedIn && !!window.Clerk?.session && !!user?.emailAddresses[0]?.emailAddress, // Email varsa çalışsın
    retry: 3, // 3 kez dene
    retryDelay: 1000 // 1 saniye bekle
  });

  const notifications = notificationsResponse?.data || [];

  // Debug logs
  console.log('🔍 Profile Page Debug:');
  console.log('🔍 notificationsResponse:', notificationsResponse);
  console.log('🔍 notifications array:', notifications);
  console.log('🔍 notifications length:', notifications.length);
  console.log('🔍 activeTab:', activeTab);
  console.log('🔍 notificationsLoading:', notificationsLoading);
  console.log('🔍 notificationsError:', notificationsError);
  console.log('🔍 isSignedIn:', isSignedIn);

  // Kullanıcının kiralama geçmişini al
  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['userBookings'],
    queryFn: () => getUserBookings(),
    enabled: !!user?.id
  });

  const totalBookings = bookings?.data?.length || 0;
  const activeBookings = bookings?.data?.filter((booking: any) => 
    booking.status === 'ACTIVE' || booking.status === 'CONFIRMED'
  ).length || 0;

  if (!isSignedIn) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Giriş Yapın</h2>
        <p className="text-gray-600">Profil bilgilerinizi görmek için giriş yapın.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
            <User className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-gray-600">{user.emailAddresses[0]?.emailAddress}</p>
            <p className="text-sm text-gray-500">Üye olma: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : 'Bilinmiyor'}</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Genel Bakış
              </div>
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bookings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Car className="w-5 h-5 mr-2" />
                Kiralamalarım
              </div>
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'messages'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageSquare className="h-5 w-5" />
              <span>Mesajlar</span>
              {notifications.filter((n: any) => !n.isRead).length > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {notifications.filter((n: any) => !n.isRead).length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('forms')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'forms'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Formlarım
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-2xl p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Car className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Toplam Kiralama</p>
                      <p className="text-2xl font-bold text-gray-900">{totalBookings}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-green-100 rounded-full">
                      <Calendar className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Aktif Kiralama</p>
                      <p className="text-2xl font-bold text-gray-900">{activeBookings}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <Star className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ortalama Puan</p>
                      <p className="text-2xl font-bold text-gray-900">4.8</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Bookings */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Son Kiralamalar</h2>
                
                {bookingsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Kiralamalar yükleniyor...</p>
                  </div>
                ) : (bookings?.data && bookings.data.length > 0) ? (
                  <div className="space-y-4">
                    {bookings.data.slice(0, 3).map((booking: any) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Car className="h-6 w-6 text-gray-500" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {booking.vehicle?.brand} {booking.vehicle?.model}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {new Date(booking.startDate).toLocaleDateString('tr-TR')} - {new Date(booking.endDate).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                          booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Henüz kiralama yapmadınız.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Tüm Kiralamalarım</h2>
              
              {bookingsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Kiralamalar yükleniyor...</p>
                </div>
              ) : (bookings?.data && bookings.data.length > 0) ? (
                <div className="space-y-4">
                  {bookings.data.map((booking: any) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Car className="h-6 w-6 text-gray-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {booking.vehicle?.brand} {booking.vehicle?.model}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {new Date(booking.startDate).toLocaleDateString('tr-TR')} - {new Date(booking.endDate).toLocaleDateString('tr-TR')}
                          </p>
                          <p className="text-sm text-gray-500">
                            {booking.totalDays} gün • ₺{booking.totalPrice}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'FORM_REQUIRED' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Henüz kiralama yapmadınız.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'messages' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mesajlar</h3>
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Henüz mesajınız yok.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification: any) => (
                    <div key={notification.id} className={`p-4 rounded-lg border ${notification.isRead ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{notification.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(notification.createdAt).toLocaleDateString('tr-TR')}
                          </p>
                          
                          {/* Form gerekiyorsa buton göster */}
                          {notification.type === 'BOOKING_STATUS' && 
                           notification.data && 
                           JSON.parse(notification.data).status === 'FORM_REQUIRED' && (
                            <button
                              onClick={() => navigate(`/forms/${JSON.parse(notification.data).bookingId}`)}
                              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                            >
                              Formu Görüntüle
                            </button>
                          )}
                          
                          {/* Form gönderildi notification'ı */}
                          {notification.type === 'FORM_SUBMITTED' && (
                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center">
                                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                                <span className="text-sm text-green-800 font-medium">Form Başarıyla Gönderildi</span>
                              </div>
                              <p className="text-xs text-green-600 mt-1">Admin tarafından incelendikten sonra size bilgi verilecek.</p>
                            </div>
                          )}
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'forms' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Formlarım</h2>
              
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Henüz form doldurmadınız.</p>
                <p className="text-sm text-gray-400 mt-2">Admin tarafından form istenildiğinde burada görünecek.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 