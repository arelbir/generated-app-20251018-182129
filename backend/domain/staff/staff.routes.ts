/**
 * Staff Routes
 * Route definitions and middleware composition for Staff domain
 */
import { Router } from 'express';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { StaffRepository } from './staff.repository';
import { StaffValidator, createStaffSchema, updateStaffSchema } from './staff.validator';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';

// Lazy Dependency Injection (DIP)
// Initialize dependencies when first route is accessed, not at module load time
let controller: StaffController;

function getController(): StaffController {
  if (!controller) {
    const repository = new StaffRepository();
    const validator = new StaffValidator();
    const service = new StaffService(repository, validator);
    controller = new StaffController(service);
  }
  return controller;
}

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// CRUD Routes
router.get('/', getController().getAll.bind(getController()));
router.get('/active', getController().getActive.bind(getController()));
router.get('/available', getController().getAvailable.bind(getController()));
router.get('/search', getController().search.bind(getController()));
router.get('/:id', getController().getById.bind(getController()));
router.get('/:id/specialization', getController().getWithSpecialization.bind(getController()));
router.get('/:id/schedule', getController().getWithSchedule.bind(getController()));
router.get('/:id/performance', requireRole('admin'), getController().getPerformance.bind(getController()));

// Admin-only operations
router.post('/', requireRole('admin'), validate(createStaffSchema), getController().create.bind(getController()));
router.put('/:id', requireRole('admin'), validate(updateStaffSchema), getController().update.bind(getController()));
router.put('/:id/working-hours', requireRole('admin'), getController().updateWorkingHours.bind(getController()));
router.post('/:id/deactivate', requireRole('admin'), getController().deactivate.bind(getController()));
router.delete('/:id', requireRole('admin'), getController().delete.bind(getController()));

export default router;
