import { ApiResponse as SharedApiResponse } from "../../shared/types"

// Enhanced API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// API Error class
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Auth context integration
let tokenProvider: (() => string | null) | null = null;

export function setTokenProvider(provider: () => string | null) {
  tokenProvider = provider;
}

// Base API client with authentication (Single Responsibility)
class ApiClient {
  private baseURL = '';

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = tokenProvider?.() || null;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.error || 'API request failed',
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Network or other errors
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0,
        error
      );
    }
  }

  // HTTP methods
  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      }
    );
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      }
    );
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      }
    );
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Singleton instance
export const apiClient = new ApiClient();

// Backward compatibility
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiClient.request<T>(path, init);

  if (!response.success || response.data === undefined) {
    throw new Error(response.error || 'Request failed');
  }

  return response.data;
}

// Hook for authenticated API calls (React integration)
export function useApi() {
  return {
    get: <T = any>(endpoint: string) => apiClient.get<T>(endpoint),
    post: <T = any>(endpoint: string, data?: any) => apiClient.post<T>(endpoint, data),
    put: <T = any>(endpoint: string, data?: any) => apiClient.put<T>(endpoint, data),
    patch: <T = any>(endpoint: string, data?: any) => apiClient.patch<T>(endpoint, data),
    delete: <T = any>(endpoint: string) => apiClient.delete<T>(endpoint),
  };
}

// Type-safe API service classes (Interface Segregation)
export class ApiService {
  protected api = apiClient;

  protected async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    data?: any
  ): Promise<T> {
    const response = await this.api.request<T>(endpoint, {
      method,
      ...(data && method !== 'GET' ? { body: JSON.stringify(data) } : {}),
    });

    if (!response.success) {
      throw new ApiError(response.error || 'Request failed', 400, response);
    }

    return response.data as T;
  }
}

// Specific service classes (Single Responsibility)
export class MembersService extends ApiService {
  async getAll(page = 0, limit = 10): Promise<any[]> {
    const response = await this.api.get(`/members?page=${page}&limit=${limit}`);
    return response.data?.items || [];
  }

  async getById(id: string): Promise<any> {
    const response = await this.api.get(`/members/${id}`);
    return response.data;
  }

  async create(data: any): Promise<any> {
    const response = await this.api.post('/members', data);
    return response.data;
  }

  async update(id: string, data: any): Promise<any> {
    const response = await this.api.put(`/members/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/members/${id}`);
  }
}

export class SessionsService extends ApiService {
  async getAll(page = 0, limit = 10): Promise<any[]> {
    const response = await this.api.get(`/sessions?page=${page}&limit=${limit}`);
    return response.data?.items || [];
  }

  async create(data: any): Promise<any> {
    const response = await this.api.post('/sessions', data);
    return response.data;
  }

  async update(id: string, data: any): Promise<any> {
    const response = await this.api.put(`/sessions/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/sessions/${id}`);
  }
}

export class PackagesService extends ApiService {
  async getAll(page = 0, limit = 10): Promise<any[]> {
    const response = await this.api.get(`/packages?page=${page}&limit=${limit}`);
    return response.data?.items || [];
  }

  async create(data: any): Promise<any> {
    const response = await this.api.post('/packages', data);
    return response.data;
  }

  async update(id: string, data: any): Promise<any> {
    const response = await this.api.put(`/packages/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/packages/${id}`);
  }
}

export class MeasurementsService extends ApiService {
  async getAll(page = 0, limit = 10, memberId?: string): Promise<any[]> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(memberId && { memberId }),
    });
    const response = await this.api.get(`/measurements?${params}`);
    return response.data?.items || [];
  }

  async create(data: any): Promise<any> {
    const response = await this.api.post('/measurements', data);
    return response.data;
  }
}

export class StaffService extends ApiService {
  async getAll(page = 0, limit = 10): Promise<any[]> {
    const response = await this.api.get(`/staff?page=${page}&limit=${limit}`);
    return response.data?.items || [];
  }

  async create(data: any): Promise<any> {
    const response = await this.api.post('/staff', data);
    return response.data;
  }

  async update(id: string, data: any): Promise<any> {
    const response = await this.api.put(`/staff/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/staff/${id}`);
  }
}

export class HealthConditionsService extends ApiService {
  async getAll(page = 0, limit = 10, memberId?: string): Promise<any[]> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(memberId && { memberId }),
    });
    const response = await this.api.get(`/health-conditions?${params}`);
    return response.data?.items || [];
  }

  async create(data: any): Promise<any> {
    const response = await this.api.post('/health-conditions', data);
    return response.data;
  }

  async update(id: string, data: any): Promise<any> {
    const response = await this.api.put(`/health-conditions/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/health-conditions/${id}`);
  }
}

export class SpecializationsService extends ApiService {
  async getAll(page = 0, limit = 10): Promise<any[]> {
    const response = await this.api.get(`/specializations?page=${page}&limit=${limit}`);
    return response.data?.items || [];
  }

  async create(data: any): Promise<any> {
    const response = await this.api.post('/specializations', data);
    return response.data;
  }

  async update(id: string, data: any): Promise<any> {
    const response = await this.api.put(`/specializations/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/specializations/${id}`);
  }
}

// Export service instances (Singleton pattern)
export const membersService = new MembersService();
export const sessionsService = new SessionsService();
export const packagesService = new PackagesService();
export const measurementsService = new MeasurementsService();
export const staffService = new StaffService();
export const healthConditionsService = new HealthConditionsService();
export const specializationsService = new SpecializationsService();