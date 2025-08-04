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
import authRoutes from './modules/auth/routes';
import vehicleRoutes from './modules/vehicles/routes';

// Load environment variables
dotenv.config();

const app = express();
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
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT alındı, server kapatılıyor...');
  server.close(() => {
    console.log('Server kapatıldı');
    process.exit(0);
  });
});

export { app, io }; 