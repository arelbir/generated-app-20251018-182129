/**
 * Package Routes
 * Route definitions and middleware composition for Package domain
 */
import { Router } from 'express';
import { PackageController } from './package.controller';
import { PackageService } from './package.service';
import { PackageRepository } from './package.repository';
import { PackageValidator, createPackageSchema, updatePackageSchema } from './package.validator';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';

// Lazy Dependency Injection (DIP)
// Initialize dependencies when first route is accessed, not at module load time
let controller: PackageController;

function getController(): PackageController {
  if (!controller) {
    const repository = new PackageRepository();
    const validator = new PackageValidator();
    const service = new PackageService(repository, validator);
    controller = new PackageController(service);
  }
  return controller;
}

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// CRUD Routes
router.get('/', getController().getAll.bind(getController()));
router.get('/search', getController().search.bind(getController()));
router.get('/expiring', getController().getExpiring.bind(getController()));
router.get('/stats', requireRole('admin'), getController().getStats.bind(getController()));
router.get('/member/:memberId', getController().getByMember.bind(getController()));
router.get('/:id', getController().getById.bind(getController()));
router.get('/:id/member', getController().getWithMember.bind(getController()));
router.get('/:id/usage', getController().getWithUsage.bind(getController()));

// Admin-only operations
router.post('/', requireRole('admin'), validate(createPackageSchema), getController().create.bind(getController()));
router.put('/:id', requireRole('admin'), validate(updatePackageSchema), getController().update.bind(getController()));
router.post('/:id/use', requireRole('staff'), getController().useSessions.bind(getController()));
router.post('/:id/extend', requireRole('admin'), getController().extendPackage.bind(getController()));
router.delete('/:id', requireRole('admin'), getController().delete.bind(getController()));

export default router;
