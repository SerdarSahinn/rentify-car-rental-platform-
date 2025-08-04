// Format price
export const formatPrice = (price: number, currency = '₺') => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(price);
};

// Format date
export const formatDate = (date: string | Date) => {
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

// Format date time
export const formatDateTime = (date: string | Date) => {
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

// Parse JSON string safely
export const parseJson = (jsonString: string) => {
  try {
    return JSON.parse(jsonString);
  } catch {
    return [];
  }
};

// Get vehicle features as array
export const getVehicleFeatures = (features: string): string[] => {
  return parseJson(features);
};

// Get vehicle images as array
export const getVehicleImages = (images: string): string[] => {
  return parseJson(images);
};

// Get fuel type display name
export const getFuelTypeDisplay = (fuelType: string): string => {
  const fuelTypes: Record<string, string> = {
    GASOLINE: 'Benzin',
    DIESEL: 'Dizel',
    ELECTRIC: 'Elektrik',
    HYBRID: 'Hibrit',
    LPG: 'LPG',
  };
  return fuelTypes[fuelType] || fuelType;
};

// Get transmission display name
export const getTransmissionDisplay = (transmission: string): string => {
  const transmissions: Record<string, string> = {
    MANUAL: 'Manuel',
    AUTOMATIC: 'Otomatik',
  };
  return transmissions[transmission] || transmission;
};

// Get category display name
export const getCategoryDisplay = (category: string): string => {
  const categories: Record<string, string> = {
    ECONOMY: 'Ekonomik',
    COMPACT: 'Kompakt',
    MID_SIZE: 'Orta Boy',
    FULL_SIZE: 'Büyük',
    SUV: 'SUV',
    LUXURY: 'Lüks',
    VAN: 'Minibüs',
    TRUCK: 'Kamyon',
  };
  return categories[category] || category;
}; 