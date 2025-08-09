import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Config imports
import cors from './config/cors';
import { generalLimiter } from './config/rateLimit';

// Middleware imports
import { errorHandler, notFound } from './middlewares/errorHandler';

// Route imports
import bookingRoutes from './modules/bookings/routes';
import vehicleRoutes from './modules/vehicles/routes';
import authRoutes from './modules/auth/routes';
import userFormRoutes from './modules/userForms/routes';
import notificationRoutes from './modules/notifications/routes';
import adminRoutes from './modules/admin/routes';
import webhookRoutes from './modules/webhooks/routes';

// Load environment variables
import path from 'path';
// .env dosyasını bulma alternatif yöntemleri
const envPaths = [
  path.resolve(__dirname, '../../../.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(process.cwd(), '.env'),
  '.env'
];

let envLoaded = false;
for (const envPath of envPaths) {
  try {
    if (require('fs').existsSync(envPath)) {
      dotenv.config({ path: envPath });
      console.log('✅ .env dosyası yüklendi:', envPath);
      envLoaded = true;
      break;
    }
  } catch (error) {
    // Devam et
  }
}

if (!envLoaded) {
  console.warn('⚠️ .env dosyası bulunamadı!');
  dotenv.config(); // Varsayılan .env'i dene
}

// Debug environment variables
console.log('🔍 Environment variables loaded:');
console.log('🔍 CLERK_SECRET_KEY:', process.env.CLERK_SECRET_KEY ? 'Var' : 'Yok');
console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
console.log('🔍 PORT:', process.env.PORT);

// Eğer CLERK_SECRET_KEY yoksa manuel set et
if (!process.env.CLERK_SECRET_KEY) {
  process.env.CLERK_SECRET_KEY = 'sk_test_VTLN3iCL1XcTT74SSEVKI3AWf8Ff9pEUjMG6gLEW0X';
  console.log('🔧 CLERK_SECRET_KEY manuel olarak ayarlandı');
}

const app: express.Application = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(compression());

// CORS
app.use(cors);

// Rate limiting
app.use(generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/forms', userFormRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/webhooks', webhookRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Yeni kullanıcı bağlandı:', socket.id);

  socket.on('join-room', (userId: string) => {
    socket.join(`user-${userId}`);
    console.log(`Kullanıcı ${userId} odasına katıldı`);
  });

  socket.on('disconnect', () => {
    console.log('Kullanıcı ayrıldı:', socket.id);
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server ${PORT} portunda çalışıyor`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM alındı, server kapatılıyor...');
  server.close(() => {
    console.log('Server kapatıldı');
  });
});

export { app, io, server }; 