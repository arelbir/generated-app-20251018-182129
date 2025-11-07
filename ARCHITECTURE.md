# 🏗️ MorFit Studio Suite - Architecture Documentation

## 📐 SOLID + DRY Architecture Pattern

### Core Principles

This architecture follows **SOLID** principles and **DRY** (Don't Repeat Yourself) methodology to ensure:
- Maintainable and scalable codebase
- Testable components
- Reusable code
- Clear separation of concerns

---

## 🎯 Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    HTTP Layer (Routes)                   │
│  - Route definitions                                     │
│  - Middleware application                                │
│  - Dependency injection                                  │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Controller Layer (HTTP Handlers)            │
│  - Request/Response handling                             │
│  - HTTP status codes                                     │
│  - Response formatting                                   │
│  - Extends: BaseController                               │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│               Service Layer (Business Logic)             │
│  - Business rules                                        │
│  - Validation                                            │
│  - Orchestration                                         │
│  - Extends: BaseService                                  │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│             Repository Layer (Data Access)               │
│  - Database queries                                      │
│  - Data transformation                                   │
│  - Extends: BaseRepository                               │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                  Database Layer (Drizzle ORM)            │
│  - Schema definitions                                    │
│  - Migrations                                            │
│  - Connection management                                 │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Domain Structure (Example: Members)

```typescript
domain/members/
├── member.repository.ts   // Data Access Layer
├── member.service.ts      // Business Logic Layer
├── member.controller.ts   // HTTP Handler Layer
├── member.validator.ts    // Validation Layer
├── member.types.ts        // Type Definitions
└── member.routes.ts       // Route Definitions
```

### 1. Repository Layer (Data Access)

**Responsibility:** Database operations only
**Extends:** BaseRepository
**Implements:** IRepository<T>

```typescript
// member.repository.ts
export class MemberRepository extends BaseRepository<Member> {
  constructor() {
    super(getDb(), schema.members);
  }
  
  // Domain-specific queries
  async findByEmail(email: string): Promise<Member | null> {
    // Pure data access logic
  }
  
  async findWithSessions(id: string): Promise<MemberWithSessions> {
    // Join queries, data transformation
  }
}
```

**Key Points:**
- ✅ No business logic
- ✅ No validation
- ✅ Only database operations
- ✅ Returns raw data or null

---

### 2. Service Layer (Business Logic)

**Responsibility:** Business rules and orchestration
**Extends:** BaseService
**Implements:** IService<T>

```typescript
// member.service.ts
export class MemberService extends BaseService<Member> {
  constructor(
    protected repository: MemberRepository,
    protected validator: MemberValidator,
    private emailService: IEmailService // DIP: Interface dependency
  ) {
    super(repository, validator);
  }
  
  async create(data: CreateMemberDTO): Promise<Member> {
    // 1. Validate input
    this.validator.validateCreate(data);
    
    // 2. Business rule: Check duplicate
    const existing = await this.repository.findByEmail(data.email);
    if (existing) throw new ValidationError('Email exists');
    
    // 3. Create member
    const member = await this.repository.create(data);
    
    // 4. Side effect: Send email (async)
    this.emailService.sendWelcomeEmail(member.email, member.fullName);
    
    return member;
  }
}
```

**Key Points:**
- ✅ Contains business logic
- ✅ Validates input
- ✅ Orchestrates multiple operations
- ✅ Depends on interfaces (DIP)
- ✅ Throws domain-specific errors

---

### 3. Controller Layer (HTTP Handlers)

**Responsibility:** HTTP request/response handling
**Extends:** BaseController

```typescript
// member.controller.ts
export class MemberController extends BaseController<Member> {
  constructor(protected service: MemberService) {
    super(service);
  }
  
  search = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Extract parameters
      const { q } = req.query;
      const params = this.extractPaginationParams(req);
      
      // 2. Call service
      const result = await this.service.searchMembers(q as string, params);
      
      // 3. Format response
      res.json(this.formatResponse(result));
    } catch (error) {
      // 4. Pass to error handler
      next(error);
    }
  }
}
```

**Key Points:**
- ✅ No business logic
- ✅ Only HTTP concerns
- ✅ Delegates to service
- ✅ Formats responses
- ✅ Handles errors via middleware

---

### 4. Validator Layer

**Responsibility:** Input validation
**Uses:** Zod schemas

```typescript
// member.validator.ts
import { z } from 'zod';

export const createMemberSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^(\+90|0)?[0-9]{10}$/),
  birthDate: z.string().datetime().optional(),
});

export class MemberValidator extends BaseValidator {
  validateCreate(data: unknown): ValidationResult<CreateMemberDTO> {
    return this.validate(createMemberSchema, data);
  }
}
```

**Key Points:**
- ✅ Declarative validation
- ✅ Type-safe with Zod
- ✅ Reusable schemas
- ✅ Clear error messages

---

### 5. Routes Layer

**Responsibility:** Route definitions and middleware composition

```typescript
// member.routes.ts
import { Router } from 'express';

// Dependency Injection
const repository = new MemberRepository();
const validator = new MemberValidator();
const service = new MemberService(repository, validator, emailService);
const controller = new MemberController(service);

const router = Router();

// Apply middleware
router.use(authenticateToken);

// Define routes
router.get('/', controller.getAll);
router.get('/search', controller.search);
router.get('/:id', controller.getById);
router.post('/', requireRole('admin'), validate(createMemberSchema), controller.create);
router.put('/:id', requireRole('admin'), validate(updateMemberSchema), controller.update);
router.delete('/:id', requireRole('admin'), controller.delete);

export default router;
```

**Key Points:**
- ✅ Manual dependency injection
- ✅ Middleware composition
- ✅ Route ordering matters
- ✅ Clean and readable

---

## 🔄 Request Flow Example

```
1. HTTP Request
   ↓
2. Route Middleware Stack
   - authenticateToken
   - requireRole('admin')
   - validate(schema)
   ↓
3. Controller.create()
   - Extract request data
   - Call service.create()
   ↓
4. Service.create()
   - Validate business rules
   - Check duplicates (repository)
   - Create member (repository)
   - Send email (emailService)
   ↓
5. Repository.create()
   - Execute database query
   - Return raw data
   ↓
6. Service returns Member
   ↓
7. Controller formats response
   ↓
8. HTTP Response
```

---

## 🎨 Base Classes (DRY Implementation)

### BaseRepository<T>

```typescript
export abstract class BaseRepository<T> implements IRepository<T> {
  constructor(protected db: Database, protected table: string) {}
  
  async findAll(params: PaginationParams): Promise<PaginatedResult<T>> {
    // Generic pagination logic
  }
  
  async findById(id: string): Promise<T | null> {
    // Generic find by ID
  }
  
  async create(data: Partial<T>): Promise<T> {
    // Generic create
  }
  
  async update(id: string, data: Partial<T>): Promise<T> {
    // Generic update
  }
  
  async delete(id: string): Promise<boolean> {
    // Generic delete
  }
}
```

**Benefits:**
- ✅ No code duplication
- ✅ Consistent CRUD operations
- ✅ Easy to extend
- ✅ Type-safe

---

### BaseService<T>

```typescript
export abstract class BaseService<T> implements IService<T> {
  constructor(
    protected repository: IRepository<T>,
    protected validator: IValidator<T>
  ) {}
  
  async getAll(params: PaginationParams): Promise<PaginatedResult<T>> {
    return this.repository.findAll(params);
  }
  
  async getById(id: string): Promise<T> {
    this.validator.validateId(id);
    const item = await this.repository.findById(id);
    if (!item) throw new NotFoundError(`${this.getResourceName()} not found`);
    return item;
  }
  
  protected abstract getResourceName(): string;
}
```

**Benefits:**
- ✅ Common business logic
- ✅ Consistent error handling
- ✅ Template method pattern
- ✅ Easy to override

---

### BaseController

```typescript
export abstract class BaseController<T> {
  constructor(protected service: IService<T>) {}
  
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = this.extractPaginationParams(req);
      const result = await this.service.getAll(params);
      res.json(this.formatResponse(result));
    } catch (error) {
      next(error);
    }
  }
  
  protected extractPaginationParams(req: Request): PaginationParams {
    return {
      page: parseInt(req.query.page as string) || 0,
      limit: parseInt(req.query.limit as string) || 10
    };
  }
  
  protected formatResponse(data: any): ApiResponse {
    return { success: true, data };
  }
}
```

**Benefits:**
- ✅ Consistent HTTP handling
- ✅ Standard response format
- ✅ Error handling via middleware
- ✅ Reusable utilities

---

## 🔐 Dependency Inversion (DIP)

### Interface-Based Dependencies

```typescript
// Define interface
export interface IEmailService {
  sendWelcomeEmail(to: string, name: string): Promise<void>;
  sendPasswordReset(to: string, token: string): Promise<void>;
}

// Implementation
export class NodemailerService implements IEmailService {
  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    // Nodemailer implementation
  }
}

// Service depends on interface, not implementation
export class MemberService {
  constructor(
    private emailService: IEmailService // DIP: Interface dependency
  ) {}
}

// Easy to swap implementations
const emailService = new NodemailerService(); // or MockEmailService for testing
const service = new MemberService(repository, validator, emailService);
```

**Benefits:**
- ✅ Testable (easy to mock)
- ✅ Flexible (easy to swap)
- ✅ Decoupled
- ✅ SOLID compliant

---

## 🛡️ Error Handling Strategy

### Custom Error Hierarchy

```typescript
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}
```

### Centralized Error Handler

```typescript
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error:', { error: err.message, stack: err.stack });
  
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }
  
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
};
```

**Benefits:**
- ✅ Consistent error responses
- ✅ Proper HTTP status codes
- ✅ Centralized logging
- ✅ Type-safe errors

---

## 📊 Testing Strategy

### Unit Tests (Isolated)

```typescript
describe('MemberService', () => {
  let service: MemberService;
  let mockRepository: jest.Mocked<MemberRepository>;
  let mockEmailService: jest.Mocked<IEmailService>;
  
  beforeEach(() => {
    mockRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    } as any;
    
    mockEmailService = {
      sendWelcomeEmail: jest.fn(),
    } as any;
    
    service = new MemberService(mockRepository, validator, mockEmailService);
  });
  
  it('should create member and send welcome email', async () => {
    mockRepository.findByEmail.mockResolvedValue(null);
    mockRepository.create.mockResolvedValue(mockMember);
    
    const result = await service.create(createDTO);
    
    expect(mockRepository.create).toHaveBeenCalledWith(createDTO);
    expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalled();
    expect(result).toEqual(mockMember);
  });
});
```

### Integration Tests (End-to-End)

```typescript
describe('POST /api/members', () => {
  it('should create a new member', async () => {
    const response = await request(app)
      .post('/api/members')
      .set('Authorization', `Bearer ${token}`)
      .send(createDTO)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe(createDTO.email);
  });
});
```

---

## 🎯 Key Takeaways

1. **Single Responsibility:** Her class/module tek bir iş yapar
2. **Open/Closed:** Base class'ları extend et, modify etme
3. **Liskov Substitution:** Alt sınıflar üst sınıf yerine kullanılabilir
4. **Interface Segregation:** Küçük, focused interface'ler
5. **Dependency Inversion:** Interface'lere depend et, implementation'lara değil
6. **DRY:** Kod tekrarı yok, her şey reusable
7. **Testability:** Her layer bağımsız test edilebilir
8. **Maintainability:** Değişiklikler kolay ve güvenli

---

**Bu mimari ile:**
- ✅ Kod tekrarı minimum
- ✅ Test coverage yüksek
- ✅ Değişiklikler kolay
- ✅ Yeni feature'lar hızlı eklenir
- ✅ Bug'lar kolay bulunur
- ✅ Kod okunabilir ve anlaşılır
