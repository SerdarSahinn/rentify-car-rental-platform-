import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-react';
import { User, Calendar, Star, Heart, Settings, Edit, Save, X } from 'lucide-react';
import { authApi } from '../services/api';
import type { User as UserType } from '../types/index.js';
import { formatPrice } from '../utils/format';

const ProfilePage = () => {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => authApi.getProfile(),
  });

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: () => authApi.getStats(),
  });

  const handleEdit = () => {
    if (profile?.data) {
      setEditData({
        firstName: profile.data.firstName || '',
        lastName: profile.data.lastName || '',
        phone: profile.data.phone || '',
      });
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // TODO: Implement update profile
      console.log('Güncellenecek veriler:', editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Profil güncellenirken hata:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Profil bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  const userData = profile?.data;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          Profil Sayfası
        </h1>
        <p className="text-gray-600">Hesap bilgilerinizi yönetin ve rezervasyon geçmişinizi görüntüleyin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Kolon - Profil Bilgileri */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profil Kartı */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Profil Bilgileri</h2>
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Düzenle</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>Kaydet</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>İptal</span>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Avatar ve Temel Bilgiler */}
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <User className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {userData?.firstName} {userData?.lastName}
                  </h3>
                  <p className="text-gray-600">{user?.emailAddresses[0]?.emailAddress}</p>
                  <p className="text-sm text-gray-500">Üye olma: {new Date(userData?.createdAt || '').toLocaleDateString('tr-TR')}</p>
                </div>
              </div>

              {/* Form Alanları */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ad
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.firstName}
                      onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{userData?.firstName || 'Belirtilmemiş'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Soyad
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.lastName}
                      onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{userData?.lastName || 'Belirtilmemiş'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{userData?.phone || 'Belirtilmemiş'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rol
                  </label>
                  <p className="text-gray-900 capitalize">{userData?.role || 'user'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* İstatistikler */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">İstatistikler</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-xl">
                <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-blue-600">{stats?.data?.totalBookings || 0}</div>
                <p className="text-gray-600">Toplam Rezervasyon</p>
              </div>
              <div className="text-center p-6 bg-yellow-50 rounded-xl">
                <Star className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-yellow-600">{stats?.data?.totalReviews || 0}</div>
                <p className="text-gray-600">Yazılan Yorum</p>
              </div>
              <div className="text-center p-6 bg-red-50 rounded-xl">
                <Heart className="h-8 w-8 text-red-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-red-600">{stats?.data?.totalFavorites || 0}</div>
                <p className="text-gray-600">Favori Araç</p>
              </div>
            </div>
          </div>

          {/* Rezervasyon Geçmişi */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Rezervasyon Geçmişi</h2>
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Henüz rezervasyon yapmamışsınız.</p>
              <p className="text-sm text-gray-400 mt-2">İlk rezervasyonunuzu yapmak için araçları keşfedin.</p>
            </div>
          </div>
        </div>

        {/* Sağ Kolon - Hızlı İşlemler */}
        <div className="space-y-6">
          {/* Hızlı İşlemler */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <Calendar className="h-5 w-5 text-blue-500" />
                <span className="text-gray-700">Yeni Rezervasyon</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <Heart className="h-5 w-5 text-red-500" />
                <span className="text-gray-700">Favorilerim</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="text-gray-700">Yorumlarım</span>
              </button>
            </div>
          </div>

          {/* Hesap Ayarları */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hesap Ayarları</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <Settings className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">Bildirim Ayarları</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">Güvenlik</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <Settings className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">Gizlilik</span>
              </button>
            </div>
          </div>

          {/* Hesap Durumu */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hesap Durumu</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Durum</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  userData?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {userData?.isActive ? 'Aktif' : 'Pasif'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Üyelik</span>
                <span className="text-gray-900">Standart</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Son Giriş</span>
                <span className="text-gray-900">Bugün</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 