import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Uploads klasörünü oluştur
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Vehicles klasörünü oluştur
const vehiclesDir = path.join(uploadsDir, 'vehicles');
if (!fs.existsSync(vehiclesDir)) {
  fs.mkdirSync(vehiclesDir, { recursive: true });
}

// Multer storage konfigürasyonu
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, vehiclesDir);
  },
  filename: function (req, file, cb) {
    // Benzersiz dosya adı oluştur
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'vehicle-' + uniqueSuffix + ext);
  }
});

// Dosya filtresi - sadece resim dosyaları
const fileFilter = (req: any, file: any, cb: any) => {
  // Allowed mime types
  const allowedMimes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Sadece resim dosyaları yüklenebilir! (JPEG, PNG, GIF, WebP)'), false);
  }
};

// Multer konfigürasyonu
export const uploadVehicleImages = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maksimum 10 dosya
  },
  fileFilter: fileFilter
});

// Tek resim yükleme
export const uploadSingle = uploadVehicleImages.single('image');

// Çoklu resim yükleme
export const uploadMultiple = uploadVehicleImages.array('images', 10);

// Resim URL'ini oluştur
export const getImageUrl = (filename: string) => {
  return `/uploads/vehicles/${filename}`;
};

// Resim dosyasını sil
export const deleteImage = (filename: string) => {
  try {
    const filePath = path.join(vehiclesDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Resim silinirken hata:', error);
    return false;
  }
};
