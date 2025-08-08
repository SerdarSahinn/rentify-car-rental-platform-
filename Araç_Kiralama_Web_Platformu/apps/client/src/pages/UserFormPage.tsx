import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FileText, 
  Upload, 
  User, 
  CreditCard, 
  Phone, 
  CheckCircle
} from 'lucide-react';
import { createForm } from '../services/formApi';

const UserFormPage = () => {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    tcNumber: '',
    driverLicense: '',
    licenseExpiry: '',
    phoneNumber: '',
    address: '',
    emergencyContact: '',
    tcPhoto: null as File | null,
    driverLicensePhoto: null as File | null,
    selfiePhoto: null as File | null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form gönderme mutation'ı
  const formMutation = useMutation({
    mutationFn: createForm,
    onSuccess: () => {
      // Notification'ları yenile
      queryClient.invalidateQueries({ queryKey: ['userNotifications'] });
      // Booking'leri yenile
      queryClient.invalidateQueries({ queryKey: ['userBookings'] });
      navigate('/profile?tab=messages'); // Mesajlar tabına git
    },
    onError: (error) => {
      console.error('Form gönderme hatası:', error);
    }
  });

  if (!isSignedIn) {
    navigate('/');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        [field]: file
      }));
      
      if (errors[field]) {
        setErrors(prev => ({
          ...prev,
          [field]: ''
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.tcNumber) newErrors.tcNumber = 'TC Kimlik No gereklidir';
    if (!formData.driverLicense) newErrors.driverLicense = 'Sürücü Belgesi No gereklidir';
    if (!formData.licenseExpiry) newErrors.licenseExpiry = 'Sürücü Belgesi Geçerlilik tarihi gereklidir';
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Telefon numarası gereklidir';
    if (!formData.address) newErrors.address = 'Adres gereklidir';
    if (!formData.emergencyContact) newErrors.emergencyContact = 'Acil durum iletişim bilgisi gereklidir';
    if (!formData.tcPhoto) newErrors.tcPhoto = 'TC Kimlik fotoğrafı gereklidir';
    if (!formData.driverLicensePhoto) newErrors.driverLicensePhoto = 'Sürücü belgesi fotoğrafı gereklidir';
    if (!formData.selfiePhoto) newErrors.selfiePhoto = 'Selfie fotoğrafı gereklidir';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = {
        bookingId: bookingId!,
        tcNumber: formData.tcNumber,
        driverLicense: formData.driverLicense,
        licenseExpiry: formData.licenseExpiry,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        emergencyContact: formData.emergencyContact,
      };

      formMutation.mutate(formDataToSend);
    } catch (error) {
      console.error('Form gönderme hatası:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Kiralama Formu</h1>
          </div>
          <p className="text-gray-600">
            Kiralama işleminizi tamamlamak için aşağıdaki bilgileri doldurun ve gerekli belgeleri yükleyin.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Kişisel Bilgiler */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Kişisel Bilgiler
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TC Kimlik No *
                  </label>
                  <input
                    type="text"
                    name="tcNumber"
                    value={formData.tcNumber}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.tcNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="12345678901"
                    maxLength={11}
                  />
                  {errors.tcNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.tcNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon Numarası *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0555 123 45 67"
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sürücü Belgesi Bilgileri */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Sürücü Belgesi Bilgileri
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sürücü Belgesi No *
                  </label>
                  <input
                    type="text"
                    name="driverLicense"
                    value={formData.driverLicense}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.driverLicense ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="12345678901"
                  />
                  {errors.driverLicense && (
                    <p className="text-red-500 text-sm mt-1">{errors.driverLicense}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Geçerlilik Tarihi *
                  </label>
                  <input
                    type="date"
                    name="licenseExpiry"
                    value={formData.licenseExpiry}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.licenseExpiry ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.licenseExpiry && (
                    <p className="text-red-500 text-sm mt-1">{errors.licenseExpiry}</p>
                  )}
                </div>
              </div>
            </div>

            {/* İletişim Bilgileri */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                İletişim Bilgileri
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adres *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Tam adresinizi girin"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Acil Durum İletişim *
                  </label>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.emergencyContact ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ad Soyad - Telefon"
                  />
                  {errors.emergencyContact && (
                    <p className="text-red-500 text-sm mt-1">{errors.emergencyContact}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Belge Yüklemeleri */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Belge Yüklemeleri
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* TC Kimlik Fotoğrafı */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TC Kimlik Fotoğrafı *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'tcPhoto')}
                      className="hidden"
                      id="tcPhoto"
                    />
                    <label htmlFor="tcPhoto" className="cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Fotoğraf Yükle</p>
                      {formData.tcPhoto && (
                        <p className="text-xs text-green-600 mt-1">✓ {formData.tcPhoto.name}</p>
                      )}
                    </label>
                  </div>
                  {errors.tcPhoto && (
                    <p className="text-red-500 text-sm mt-1">{errors.tcPhoto}</p>
                  )}
                </div>

                {/* Sürücü Belgesi Fotoğrafı */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sürücü Belgesi Fotoğrafı *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'driverLicensePhoto')}
                      className="hidden"
                      id="driverLicensePhoto"
                    />
                    <label htmlFor="driverLicensePhoto" className="cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Fotoğraf Yükle</p>
                      {formData.driverLicensePhoto && (
                        <p className="text-xs text-green-600 mt-1">✓ {formData.driverLicensePhoto.name}</p>
                      )}
                    </label>
                  </div>
                  {errors.driverLicensePhoto && (
                    <p className="text-red-500 text-sm mt-1">{errors.driverLicensePhoto}</p>
                  )}
                </div>

                {/* Selfie Fotoğrafı */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selfie Fotoğrafı *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'selfiePhoto')}
                      className="hidden"
                      id="selfiePhoto"
                    />
                    <label htmlFor="selfiePhoto" className="cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Fotoğraf Yükle</p>
                      {formData.selfiePhoto && (
                        <p className="text-xs text-green-600 mt-1">✓ {formData.selfiePhoto.name}</p>
                      )}
                    </label>
                  </div>
                  {errors.selfiePhoto && (
                    <p className="text-red-500 text-sm mt-1">{errors.selfiePhoto}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Formu Gönder
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserFormPage;
