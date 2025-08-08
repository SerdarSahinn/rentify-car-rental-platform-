import api from './api';

export interface UserForm {
  id: string;
  userId: string;
  bookingId: string;
  tcNumber: string;
  driverLicense: string;
  licenseExpiry: string;
  phoneNumber: string;
  address: string;
  emergencyContact: string;
  isApproved: boolean;
  isRejected: boolean;
  rejectionReason?: string;
  submittedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  booking?: {
    id: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    totalPrice: number;
    status: string;
    vehicle?: {
      id: string;
      brand: string;
      model: string;
      year: number;
    };
  };
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
}

export interface CreateFormData {
  bookingId: string;
  tcNumber: string;
  driverLicense: string;
  licenseExpiry: string;
  phoneNumber: string;
  address: string;
  emergencyContact: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Kullanıcının formlarını getir
export const getUserForms = async (): Promise<ApiResponse<UserForm[]>> => {
  const response = await api.get('/forms/user');
  return response.data;
};

// Tüm formları getir (admin için)
export const getAllForms = async (): Promise<ApiResponse<UserForm[]>> => {
  const response = await api.get('/forms');
  return response.data;
};

// Form detayını getir
export const getFormById = async (formId: string): Promise<ApiResponse<UserForm>> => {
  const response = await api.get(`/forms/${formId}`);
  return response.data;
};

// Form oluştur
export const createForm = async (formData: CreateFormData): Promise<ApiResponse<UserForm>> => {
  const response = await api.post('/forms', formData);
  return response.data;
};

// Form durumunu güncelle (admin için)
export const updateFormStatus = async (
  formId: string, 
  status: { isApproved?: boolean; isRejected?: boolean; rejectionReason?: string }
): Promise<ApiResponse<UserForm>> => {
  const response = await api.patch(`/forms/${formId}/status`, status);
  return response.data;
};

