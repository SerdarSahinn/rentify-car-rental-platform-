import { Router } from 'express';
import { UserFormController } from './controller';
import { authenticateUser, requireAdmin } from '../../middlewares/auth';

const router: Router = Router();
const userFormController = new UserFormController();

// Kullanıcının formlarını getir
router.get('/user', authenticateUser, userFormController.getUserForms.bind(userFormController));

// Tüm formları getir (admin için)
router.get('/', authenticateUser, requireAdmin, userFormController.getAllForms.bind(userFormController));

// Form detayını getir
router.get('/:formId', authenticateUser, userFormController.getFormById.bind(userFormController));

// Form oluştur
router.post('/', authenticateUser, userFormController.createForm.bind(userFormController));

// Form durumunu güncelle (admin için)
router.patch('/:formId/status', authenticateUser, requireAdmin, userFormController.updateFormStatus.bind(userFormController));

export default router;

