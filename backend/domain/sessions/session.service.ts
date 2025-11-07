/**
 * Session Service
 * Business logic layer for Session domain
 * Extends BaseService for common CRUD operations
 */
import { BaseService } from '../../core/base/BaseService';
import { Session, CreateSessionDTO, UpdateSessionDTO, SessionWithMember, SessionSearchDTO } from './session.types';
import { SessionRepository } from './session.repository';
import { SessionValidator } from './session.validator';
import { ValidationError, ConflictError, NotFoundError } from '../../core/types/ErrorTypes';
import { logger } from '../../utils';

export class SessionService extends BaseService<Session> {
  constructor(
    protected repository: SessionRepository,
    protected validator: SessionValidator
  ) {
    super(repository, validator);
  }

  /**
   * Get resource name for error messages
   */
  protected getResourceName(): string {
    return 'Session';
  }

  /**
   * Business logic: Create session with conflict checking
   */
  async create(data: CreateSessionDTO): Promise<Session> {
    try {
      logger.debug('SessionService.create called', { memberId: data.memberId, subDeviceId: data.subDeviceId });

      // Validate input
      const validation = this.validator.validateCreate(data);
      if (!validation.success) {
        throw new ValidationError('Validation failed', validation.errors || []);
      }

      const validatedData = validation.data!;

      // Business rule: Check for time conflicts
      const hasConflict = await this.repository.checkTimeConflict(
        validatedData.subDeviceId,
        validatedData.startTime,
        validatedData.duration
      );

      if (hasConflict) {
        throw new ConflictError('Bu zaman aralığında cihaz zaten rezerve edilmiş');
      }

      // Business rule: Check member exists (would need member repository)
      // const memberExists = await memberRepository.exists(validatedData.memberId);
      // if (!memberExists) {
      //   throw new NotFoundError('Üye bulunamadı');
      // }

      // Apply before create hook
      await this.beforeCreate(validatedData as any);

      // Create session
      const session = await this.repository.create(validatedData as any);

      // Apply after create hook
      await this.afterCreate(session);

      logger.debug('SessionService.create completed', { id: session.id });
      return session;
    } catch (error) {
      logger.error('SessionService.create failed', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Business logic: Update session with validation
   */
  async update(id: string, data: UpdateSessionDTO): Promise<Session> {
    try {
      logger.debug('SessionService.update called', { id, data: Object.keys(data) });

      // Validate ID
      const idValidation = this.validator.validateId(id);
      if (!idValidation.success) {
        throw new ValidationError('Invalid ID', idValidation.errors || []);
      }

      // Check if session exists
      const existingSession = await this.repository.findById(id);
      if (!existingSession) {
        throw new NotFoundError('Seans bulunamadı');
      }

      // Validate session can be modified
      if (!this.validator.validateSessionModifiable(existingSession)) {
        throw new ValidationError('Tamamlanmış veya iptal edilmiş seanslar düzenlenemez');
      }

      // Validate update data
      const validation = this.validator.validateUpdate(data);
      if (!validation.success) {
        throw new ValidationError('Validation failed', validation.errors || []);
      }

      const validatedData = validation.data!;

      // Business rule: Check for time conflicts if time is being changed
      if (validatedData.startTime || validatedData.duration) {
        const startTime = validatedData.startTime || existingSession.startTime;
        const duration = validatedData.duration || existingSession.duration;

        const hasConflict = await this.repository.checkTimeConflict(
          existingSession.subDeviceId,
          startTime,
          duration,
          id
        );

        if (hasConflict) {
          throw new ConflictError('Bu zaman aralığında cihaz zaten rezerve edilmiş');
        }
      }

      // Apply before update hook
      await this.beforeUpdate(id, validatedData as any, existingSession);

      // Update session
      const updatedSession = await this.repository.update(id, validatedData as any);

      // Apply after update hook
      await this.afterUpdate(updatedSession);

      logger.debug('SessionService.update completed', { id });
      return updatedSession;
    } catch (error) {
      logger.error('SessionService.update failed', { id, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Business logic: Get session with member details
   */
  async getSessionWithMember(id: string): Promise<SessionWithMember | null> {
    try {
      logger.debug('SessionService.getSessionWithMember called', { id });

      const idValidation = this.validator.validateId(id);
      if (!idValidation.success) {
        throw new ValidationError('Invalid ID', idValidation.errors || []);
      }

      const session = await this.repository.findWithMember(id);

      logger.debug('SessionService.getSessionWithMember completed', { id, found: !!session });
      return session;
    } catch (error) {
      logger.error('SessionService.getSessionWithMember failed', { id, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Business logic: Search sessions with advanced filtering
   */
  async searchSessions(searchParams: SessionSearchDTO): Promise<any> {
    try {
      logger.debug('SessionService.searchSessions called', { query: searchParams.query });

      const validation = this.validator.validateSearch(searchParams);
      if (!validation.success) {
        throw new ValidationError('Invalid search parameters', validation.errors || []);
      }

      const result = await this.repository.searchSessions(validation.data!);

      logger.debug('SessionService.searchSessions completed', {
        query: searchParams.query,
        count: result.items.length
      });

      return result;
    } catch (error) {
      logger.error('SessionService.searchSessions failed', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Business logic: Get upcoming sessions
   */
  async getUpcomingSessions(limit: number = 10): Promise<Session[]> {
    try {
      logger.debug('SessionService.getUpcomingSessions called', { limit });

      const sessions = await this.repository.findUpcoming(limit);

      logger.debug('SessionService.getUpcomingSessions completed', { count: sessions.length });
      return sessions;
    } catch (error) {
      logger.error('SessionService.getUpcomingSessions failed', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Business logic: Start session (check-in)
   */
  async startSession(id: string): Promise<Session> {
    try {
      logger.debug('SessionService.startSession called', { id });

      const session = await this.repository.findById(id);
      if (!session) {
        throw new NotFoundError('Seans bulunamadı');
      }

      if (session.status !== 'confirmed') {
        throw new ValidationError('Sadece onaylanmış seanslar başlatılabilir');
      }

      // Business rule: Check if session is starting within allowed time window
      const startTime = new Date(session.startTime);
      const now = new Date();
      const timeDiff = Math.abs(now.getTime() - startTime.getTime()) / (1000 * 60); // minutes

      if (timeDiff > 60) { // 1 hour window
        throw new ValidationError('Seans başlangıç zamanı çok uzak');
      }

      await this.repository.update(id, { status: 'confirmed' } as any);

      const updatedSession = await this.repository.findById(id);
      logger.debug('SessionService.startSession completed', { id });
      return updatedSession!;
    } catch (error) {
      logger.error('SessionService.startSession failed', { id, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Business logic: Complete session
   */
  async completeSession(id: string): Promise<Session> {
    try {
      logger.debug('SessionService.completeSession called', { id });

      const session = await this.repository.findById(id);
      if (!session) {
        throw new NotFoundError('Seans bulunamadı');
      }

      if (!['confirmed'].includes(session.status)) {
        throw new ValidationError('Sadece aktif seanslar tamamlanabilir');
      }

      await this.repository.update(id, { status: 'completed' } as any);

      const updatedSession = await this.repository.findById(id);
      logger.debug('SessionService.completeSession completed', { id });
      return updatedSession!;
    } catch (error) {
      logger.error('SessionService.completeSession failed', { id, error: (error as Error).message });
      throw error;
    }
  }

  // Business Logic Hooks

  protected async beforeCreate(data: Partial<Session>): Promise<void> {
    // Set default status
    if (!data.status) {
      (data as any).status = 'booked';
    }

    // Business rule: Normalize start time
    if (data.startTime) {
      const startTime = new Date(data.startTime);
      // Round to nearest 15 minutes
      const minutes = startTime.getMinutes();
      const roundedMinutes = Math.round(minutes / 15) * 15;
      startTime.setMinutes(roundedMinutes, 0, 0);
      (data as any).startTime = startTime.toISOString();
    }
  }

  protected async afterCreate(session: Session): Promise<void> {
    // Could send notification to member
    logger.info('Session created', { sessionId: session.id, memberId: session.memberId });
  }

  protected async beforeUpdate(id: string, data: Partial<Session>, existingSession: Session): Promise<void> {
    // Log status changes
    if (data.status && data.status !== existingSession.status) {
      logger.info('Session status changed', {
        sessionId: id,
        oldStatus: existingSession.status,
        newStatus: data.status
      });
    }
  }

  protected async afterUpdate(session: Session): Promise<void> {
    // Could trigger notifications based on status changes
    logger.info('Session updated', { sessionId: session.id, status: session.status });
  }
}
