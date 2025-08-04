import { Router } from 'express';
import {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getFeaturedVehicles,
  getVehicleCategories,
} from './controller';
import { authenticateUser, requireAdmin } from '../../middlewares/auth';

const router = Router();

// Public routes
router.get('/', getAllVehicles);
router.get('/featured', getFeaturedVehicles);
router.get('/categories', getVehicleCategories);
router.get('/:id', getVehicleById);

// Protected routes (Admin only)
router.post('/', authenticateUser, requireAdmin, createVehicle);
router.put('/:id', authenticateUser, requireAdmin, updateVehicle);
router.delete('/:id', authenticateUser, requireAdmin, deleteVehicle);

export default router; 