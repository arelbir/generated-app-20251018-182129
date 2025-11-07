# Development Guide - MorFit Studio Suite

Bu kılavuz, MorFit Studio Suite projesinde geliştirme yapmak için gerekli adımları ve best practice'leri içerir.

## Geliştirme Ortamı Kurulumu

### Ön Gereksinimler
- Node.js v18.0+
- Bun package manager
- Wrangler CLI
- Git

### Kurulum Adımları

1. **Repository'yi klonlayın**:
   ```bash
   git clone <repository-url>
   cd morfit-studio-suite
   ```

2. **Bağımlılıkları yükleyin**:
   ```bash
   bun install
   ```

3. **Wrangler'ı yapılandırın** (Cloudflare Workers için):
   ```bash
   wrangler login
   ```

4. **Lokal geliştirme sunucusunu başlatın**:
   ```bash
   wrangler dev
   ```
   Uygulama `http://localhost:8788` adresinde çalışacaktır.

## Proje Yapısı

```
├── src/                          # Frontend
│   ├── components/               # UI bileşenleri
│   ├── pages/                    # Sayfa bileşenleri
│   ├── hooks/                    # Özel React hooks
│   ├── lib/                      # Yardımcı fonksiyonlar
│   └── stores/                   # Zustand state stores
├── worker/                       # Backend (Cloudflare Workers)
│   ├── core-utils.ts             # Temel yardımcılar
│   ├── entities.ts               # DO entity tanımları
│   └── user-routes.ts            # API endpoints
├── shared/                       # Ortak kod
│   ├── types.ts                  # TypeScript tanımları
│   └── mock-data.ts              # Mock veri
└── docs/                         # Dokümantasyon
```

## Geliştirme Workflow

### Yeni Özellik Ekleme

1. **Branch oluşturun**:
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Kod değişikliklerini yapın**

3. **Test edin**:
   ```bash
   # Linting
   bun run lint

   # Type checking
   npx tsc --noEmit

   # Build test
   bun run build
   ```

4. **Commit edin**:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

5. **PR oluşturun**

### Code Style

- **TypeScript**: Strict mode aktif
- **ESLint**: React ve TypeScript kuralları
- **Prettier**: Code formatting
- **SOLID Principles**: Object-oriented design
- **DRY Principle**: Kod tekrarını önleyin

### Naming Conventions

- **Files**: PascalCase for components (`MemberCard.tsx`), camelCase for utilities (`apiClient.ts`)
- **Variables**: camelCase (`memberData`)
- **Types**: PascalCase (`Member`, `ApiResponse`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)

## API Geliştirme

### Yeni Endpoint Ekleme

1. **Route'u `worker/user-routes.ts`'e ekleyin**:
   ```typescript
   app.get('/api/new-endpoint', async (c) => {
     // Implementation
     return ok(c, data)
   })
   ```

2. **Entity'yi `worker/entities.ts`'e ekleyin** (gerekirse):
   ```typescript
   export class NewEntity extends IndexedEntity<NewType> {
     static readonly entityName = 'newEntity'
     // ...
   }
   ```

3. **Type'ı `shared/types.ts`'e ekleyin**

### Error Handling

- API'lerde `core-utils.ts`'den `ok()`, `bad()`, `notFound()` kullanın
- Frontend'de try-catch ile error handling yapın
- User-friendly error mesajları gösterin

## Frontend Geliştirme

### Yeni Sayfa Ekleme

1. **Sayfa bileşenini oluşturun** (`src/pages/NewPage.tsx`)
2. **Route'u ekleyin** (`src/main.tsx` veya router config)
3. **Navigation'a ekleyin** (`src/components/app-sidebar.tsx`)

### Yeni Bileşen Oluşturma

1. **Bileşeni oluşturun** (`src/components/NewComponent.tsx`)
2. **Props interface'ini tanımlayın**
3. **Storybook story ekleyin** (varsa)

### State Management

- **Local state**: `useState`
- **Global state**: Zustand stores
- **Server state**: TanStack Query

### Form Yönetimi

React Hook Form + Zod kullanın:

```tsx
const schema = z.object({
  name: z.string().min(1),
  email: z.string().email()
})

const { register, handleSubmit } = useForm({
  resolver: zodResolver(schema)
})
```

## Backend Geliştirme

### Durable Objects

- Her entity için ayrı DO sınıfı
- `IndexedEntity` base class kullanın
- Seed data ile test verilerini yükleyin

### Database İşlemleri

```typescript
// Create
const entity = await Entity.create(env, data)

// Read
const { items } = await Entity.list(env)

// Update
const updated = await Entity.update(env, id, patch)

// Delete
const deleted = await Entity.delete(env, id)
```

## Testing

### Unit Tests
```bash
# Component tests
npm run test:components

# API tests
npm run test:api
```

### E2E Tests
```bash
# Playwright tests
npm run test:e2e
```

## Deployment

### Cloudflare Deployment

1. **Build edin**:
   ```bash
   bun run build
   ```

2. **Deploy edin**:
   ```bash
   bun run deploy
   ```

### Environment Variables

Wrangler config'de (`wrangler.jsonc`):
```json
{
  "vars": {
    "ENVIRONMENT": "production"
  }
}
```

## Debugging

### Frontend Debugging
- React DevTools kullanın
- Console log'ları ekleyin
- Network tab'ında API çağrılarını inceleyin

### Backend Debugging
- Wrangler dev mode'da console log'ları görünür
- Cloudflare dashboard'da logs kontrol edin

### Performance Monitoring
- Lighthouse ile performans test edin
- Bundle analyzer ile bundle size kontrol edin

## Best Practices

### Code Quality
- Her PR için code review gerekli
- Test coverage %80+ hedefleyin
- Accessibility (a11y) standartlarına uyun

### Security
- Input validation her zaman yapın
- XSS koruması için sanitization kullanın
- API key'leri environment variable'da tutun

### Performance
- Code splitting uygulayın
- Image optimization yapın
- Bundle size'ı minimum tutun

### Documentation
- Kod içi JSDoc yorumları ekleyin
- README dosyalarını güncel tutun
- API değişikliklerinde dokümantasyonu güncelleyin

## Troubleshooting

### Common Issues

1. **Build hataları**: `bun install` tekrar çalıştırın
2. **Type hataları**: `npx tsc --noEmit` ile kontrol edin
3. **Runtime hataları**: Browser console ve Wrangler logs'u kontrol edin

### Support
- GitHub Issues için bug report açın
- Discord/Teams kanalında yardım isteyin
- Documentation'ı kontrol edin
