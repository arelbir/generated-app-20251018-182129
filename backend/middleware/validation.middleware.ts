/**
 * Validation Middleware
 * Zod schema validation for request body/params/query
 */
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '../core/types/ErrorTypes';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      const messages = error.errors?.map((e: any) => `${e.path.join('.')}: ${e.message}`) || ['Validation failed'];
      next(new ValidationError(messages.join(', ')));
    }
  };
};

export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params);
      next();
    } catch (error: any) {
      next(new ValidationError('Invalid parameters'));
    }
  };
};
