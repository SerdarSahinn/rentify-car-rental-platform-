import { useState } from 'react';
import { 
  Settings, 
  Save, 
  Globe, 
  Mail, 
  CreditCard, 
  Shield, 
  Clock, 
  MapPin,
  Phone,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const AdminSettings = () => {
  const [loading, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Site ayarları state'leri
  const [settings, setSettings] = useState({
    // Genel Ayarlar
    siteName: 'Rentify',
    siteDescription: 'Premium Araç Kiralama Platformu',
    siteUrl: 'https://rentify.com',
    contactEmail: 'info@rentify.com',
    contactPhone: '+90 212 123 45 67',
    address: 'İstanbul, Türkiye',
    
    // İş Ayarları
    operatingHours: '09:00 - 18:00',
    workingDays: 'Pazartesi - Cumartesi',
    minimumRentalDays: 1,
    maximumRentalDays: 30,
    advanceBookingDays: 90,
    
    // Ödeme Ayarları
    currency: 'TRY',
    taxRate: 18,
    depositPercentage: 20,
    cancellationPeriod: 24,
    refundProcessingDays: 5,
    
    // Email Bildirimleri
    emailNotifications: true,
    smsNotifications: false,
    newBookingAlert: true,
    paymentConfirmation: true,
    cancellationAlert: true,
    
    // Sistem Ayarları
    maintenanceMode: false,
    debugMode: false,
    allowGuestBooking: true,
    requireVerification: true,
    autoApproveBookings: false
  });

  const handleSave = async () => {
    setSaving(true);
    
    // API call simülasyonu
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1500);
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sistem Ayarları</h1>
          <p className="text-gray-600">Platform ayarlarını buradan yönetebilirsiniz</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all ${
            saved 
              ? 'bg-green-600 text-white' 
              : loading 
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          {saved ? (
            <>
              <CheckCircle className="h-5 w-5" />
              <span>Kaydedildi</span>
            </>
          ) : loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Kaydediliyor...</span>
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              <span>Kaydet</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Genel Ayarlar */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Globe className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Genel Ayarlar</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Adı
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => handleSettingChange('siteName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Açıklaması
              </label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site URL
              </label>
              <input
                type="url"
                value={settings.siteUrl}
                onChange={(e) => handleSettingChange('siteUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
        </div>

        {/* İletişim Bilgileri */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Mail className="h-6 w-6 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">İletişim Bilgileri</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline h-4 w-4 mr-2" />
                Email Adresi
              </label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => handleSettingChange('contactEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="inline h-4 w-4 mr-2" />
                Telefon Numarası
              </label>
              <input
                type="tel"
                value={settings.contactPhone}
                onChange={(e) => handleSettingChange('contactPhone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-2" />
                Adres
              </label>
              <textarea
                value={settings.address}
                onChange={(e) => handleSettingChange('address', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
        </div>

        {/* İş Ayarları */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Clock className="h-6 w-6 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">İş Ayarları</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Çalışma Saatleri
              </label>
              <input
                type="text"
                value={settings.operatingHours}
                onChange={(e) => handleSettingChange('operatingHours', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Çalışma Günleri
              </label>
              <input
                type="text"
                value={settings.workingDays}
                onChange={(e) => handleSettingChange('workingDays', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min. Kiralama (Gün)
                </label>
                <input
                  type="number"
                  value={settings.minimumRentalDays}
                  onChange={(e) => handleSettingChange('minimumRentalDays', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max. Kiralama (Gün)
                </label>
                <input
                  type="number"
                  value={settings.maximumRentalDays}
                  onChange={(e) => handleSettingChange('maximumRentalDays', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Ödeme Ayarları */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-6">
            <CreditCard className="h-6 w-6 text-yellow-600" />
            <h2 className="text-lg font-semibold text-gray-900">Ödeme Ayarları</h2>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Para Birimi
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => handleSettingChange('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="TRY">TRY (₺)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  KDV Oranı (%)
                </label>
                <input
                  type="number"
                  value={settings.taxRate}
                  onChange={(e) => handleSettingChange('taxRate', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Depozito Oranı (%)
                </label>
                <input
                  type="number"
                  value={settings.depositPercentage}
                  onChange={(e) => handleSettingChange('depositPercentage', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İptal Süresi (Saat)
                </label>
                <input
                  type="number"
                  value={settings.cancellationPeriod}
                  onChange={(e) => handleSettingChange('cancellationPeriod', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bildirim Ayarları */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-6">
            <AlertCircle className="h-6 w-6 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">Bildirim Ayarları</h2>
          </div>
          
          <div className="space-y-4">
            {[
              { key: 'emailNotifications', label: 'Email Bildirimleri' },
              { key: 'smsNotifications', label: 'SMS Bildirimleri' },
              { key: 'newBookingAlert', label: 'Yeni Rezervasyon Bildirimi' },
              { key: 'paymentConfirmation', label: 'Ödeme Onay Bildirimi' },
              { key: 'cancellationAlert', label: 'İptal Bildirimi' }
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[key as keyof typeof settings] as boolean}
                    onChange={(e) => handleSettingChange(key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Sistem Ayarları */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Shield className="h-6 w-6 text-red-600" />
            <h2 className="text-lg font-semibold text-gray-900">Sistem Ayarları</h2>
          </div>
          
          <div className="space-y-4">
            {[
              { key: 'maintenanceMode', label: 'Bakım Modu', description: 'Site geçici olarak kapatılır' },
              { key: 'debugMode', label: 'Debug Modu', description: 'Geliştirici için hata ayıklama' },
              { key: 'allowGuestBooking', label: 'Misafir Rezervasyonu', description: 'Kayıtsız kullanıcı rezervasyonu' },
              { key: 'requireVerification', label: 'Email Doğrulama', description: 'Hesap onayı gereksinimi' },
              { key: 'autoApproveBookings', label: 'Otomatik Onay', description: 'Rezervasyonları otomatik onayla' }
            ].map(({ key, label, description }) => (
              <div key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                  <p className="text-xs text-gray-500">{description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[key as keyof typeof settings] as boolean}
                    onChange={(e) => handleSettingChange(key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
