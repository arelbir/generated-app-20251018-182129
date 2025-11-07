/**
 * Session Routes
 * Route definitions and middleware composition for Session domain
 */
import { Router } from 'express';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { SessionRepository } from './session.repository';
import { SessionValidator, createSessionSchema, updateSessionSchema } from './session.validator';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';

// Lazy Dependency Injection (DIP)
// Initialize dependencies when first route is accessed, not at module load time
let controller: SessionController;

function getController(): SessionController {
  if (!controller) {
    const repository = new SessionRepository();
    const validator = new SessionValidator();
    const service = new SessionService(repository, validator);
    controller = new SessionController(service);
  }
  return controller;
}

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// CRUD Routes
router.get('/', getController().getAll.bind(getController()));
router.get('/search', getController().search.bind(getController()));
router.get('/upcoming', getController().getUpcoming.bind(getController()));
router.get('/:id', getController().getById.bind(getController()));
router.get('/:id/member', getController().getWithMember.bind(getController()));

// Admin-only operations
router.post('/', requireRole('admin'), validate(createSessionSchema), getController().create.bind(getController()));
router.put('/:id', requireRole('admin'), validate(updateSessionSchema), getController().update.bind(getController()));
router.delete('/:id', requireRole('admin'), getController().delete.bind(getController()));

// Session management (Staff/Admin)
router.post('/:id/start', requireRole('staff'), getController().startSession.bind(getController()));
router.post('/:id/complete', requireRole('staff'), getController().completeSession.bind(getController()));

export default router;
