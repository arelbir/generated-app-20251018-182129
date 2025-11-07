/**
 * Measurement Routes
 * Route definitions and middleware composition for Measurements domain
 */
import { Router } from 'express';
import { MeasurementController } from './measurement.controller';
import { MeasurementService } from './measurement.service';
import { MeasurementRepository } from './measurement.repository';
import { MeasurementValidator, createMeasurementSchema, updateMeasurementSchema } from './measurement.validator';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';

let controller: MeasurementController;

function getController(): MeasurementController {
  if (!controller) {
    const repository = new MeasurementRepository();
    const validator = new MeasurementValidator();
    const service = new MeasurementService(repository, validator);
    controller = new MeasurementController(service);
  }
  return controller;
}

const router = Router();

router.use(authenticateToken);

router.get('/', getController().getAll.bind(getController()));
router.get('/search', getController().search.bind(getController()));
router.get('/member/:memberId', getController().getByMember.bind(getController()));
router.get('/member/:memberId/latest', getController().getLatestByMember.bind(getController()));
router.get('/:id', getController().getById.bind(getController()));

router.post('/', requireRole('admin'), validate(createMeasurementSchema), getController().create.bind(getController()));
router.put('/:id', requireRole('admin'), validate(updateMeasurementSchema), getController().update.bind(getController()));
router.delete('/:id', requireRole('admin'), getController().delete.bind(getController()));

export default router;
