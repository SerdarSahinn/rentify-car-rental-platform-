import cors from 'cors';

// Basit CORS ayarları - karmaşık ayarlar sorun çıkarıyor!
const corsOptions = {
  origin: true, // Tüm origin'lere izin ver
  credentials: false, // credentials: true sorun çıkarıyor
  optionsSuccessStatus: 200,
};

export default cors(corsOptions); 