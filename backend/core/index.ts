/**
 * Core Module Index
 * Central export point for entire core module
 */

// Base classes
export * from './base';

// Interfaces - explicit exports to avoid conflicts
export type { IRepository, PaginatedResult } from './interfaces/IRepository';
export type { IService } from './interfaces/IService';
export type { IController } from './interfaces/IController';
export type { IValidator, ValidationResult } from './interfaces/IValidator';
export type { IEmailService } from './interfaces/IEmailService';
export type { IStorageService } from './interfaces/IStorageService';

// Types - use PaginationParams from types, not interfaces
export type { PaginationParams } from './types/PaginationParams';
export { DEFAULT_PAGINATION, PaginationHelper } from './types/PaginationParams';
export type { ApiResponse } from './types/ApiResponse';
export { ResponseFormatter } from './types/ApiResponse';
export * from './types/ErrorTypes';
