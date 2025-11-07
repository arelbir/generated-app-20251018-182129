/**
 * Member Routes
 * Route definitions and middleware composition for Member domain
 */
import { Router } from 'express';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';
import { MemberRepository } from './member.repository';
import { MemberValidator, createMemberSchema, updateMemberSchema } from './member.validator';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';

// Lazy Dependency Injection (DIP)
// Initialize dependencies when first route is accessed, not at module load time
let controller: MemberController;

function getController(): MemberController {
  if (!controller) {
    const repository = new MemberRepository();
    const validator = new MemberValidator();
    // const emailService = container.get<IEmailService>('EmailService'); // DI container
    const emailService = undefined; // Placeholder for now
    const service = new MemberService(repository, validator, emailService);
    controller = new MemberController(service);
  }
  return controller;
}

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// CRUD Routes
router.get('/', (req, res, next) => getController().getAll(req, res, next));
router.get('/search', (req, res, next) => getController().search(req, res, next)); // Before /:id to avoid conflict
router.get('/statistics', requireRole('admin'), (req, res, next) => getController().getStatistics(req, res, next));
router.get('/:id', (req, res, next) => getController().getById(req, res, next));
router.get('/:id/profile', (req, res, next) => getController().getProfile(req, res, next));

// Admin-only operations
router.post('/', requireRole('admin'), validate(createMemberSchema), (req, res, next) => getController().create(req, res, next));
router.put('/:id', validate(updateMemberSchema), (req, res, next) => getController().update(req, res, next));
router.delete('/:id', requireRole('admin'), (req, res, next) => getController().delete(req, res, next));
router.post('/:id/deactivate', requireRole('admin'), (req, res, next) => getController().deactivate(req, res, next));

// Bulk operations (Admin only)
router.post('/bulk-update-status', requireRole('admin'), (req, res, next) => getController().bulkUpdateStatus(req, res, next));

export default router;
