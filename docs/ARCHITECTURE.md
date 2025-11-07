# Mimari Dokümantasyonu - MorFit Studio Suite

## Genel Mimari

Bu proje, modern web uygulamaları için serverless mimariyi benimser. Frontend ve backend ayrı ayrı dağıtılır ve Cloudflare'ın küresel altyapısından yararlanır.

```
┌─────────────────┐    ┌─────────────────┐
│   React App     │    │ Cloudflare      │
│   (Vite)        │◄──►│ Workers + DO    │
│                 │    │                 │
└─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   Browser       │    │ Durable Objects │
│   Client        │    │ (Stateful       │
└─────────────────┘    │  Storage)       │
                       └─────────────────┘
```

## Frontend Mimarisi

### Teknoloji Stack
- **React 18**: Component-based UI framework
- **Vite**: Fast build tool ve development server
- **TypeScript**: Type safety ve geliştirici deneyimi
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/UI**: Re-usable component library
- **Zustand**: Lightweight state management
- **React Hook Form + Zod**: Form handling ve validation

### Klasör Yapısı
```
src/
├── components/           # UI bileşenleri
│   ├── ui/              # Shadcn/UI components
│   ├── layout/          # Layout bileşenleri
│   └── *.tsx            # Sayfa spesifik bileşenler
├── pages/               # Route bileşenleri
├── hooks/               # Özel React hooks
├── lib/                 # Utility fonksiyonları
├── stores/              # Zustand stores
└── main.tsx             # App entry point
```

### State Yönetimi
- **Zustand** ile global state
- Server state için **TanStack Query** (SWR alternatifi)
- Local component state için **useState/useReducer**

## Backend Mimarisi

### Teknoloji Stack
- **Cloudflare Workers**: Serverless runtime
- **Hono**: Web framework (Express.js benzeri)
- **Durable Objects**: Stateful storage
- **TypeScript**: Type safety

### Worker Yapısı
```
worker/
├── index.ts             # Worker entry point
├── core-utils.ts        # Yardımcı fonksiyonlar
├── entities.ts          # DO entity sınıfları
└── user-routes.ts       # API endpoints
```

### Durable Objects Tasarımı

Her entity türü için ayrı DO sınıfı:

```typescript
export class MemberEntity extends IndexedEntity<Member> {
  static readonly entityName = 'member';
  static readonly indexName = 'members';
  // ... CRUD operations
}
```

**IndexedEntity** base class'ı:
- Generic entity storage
- Index management
- Seed data loading

### API Tasarımı

RESTful endpoints with Hono:

```typescript
// GET /api/members - List members
// POST /api/members - Create member
// GET /api/members/:id - Get member
// PUT /api/members/:id - Update member
// DELETE /api/members/:id - Delete member
```

## Veri Akışı

1. **Client Request**: React app API çağrısı yapar
2. **Worker Processing**: Hono route handler request'i işler
3. **DO Operations**: Durable Object state'ini günceller
4. **Response**: Client'a JSON response döner

## Güvenlik

- **Environment Variables**: Hassas veriler için CF env vars
- **Type Safety**: End-to-end TypeScript
- **Input Validation**: Zod schemas
- **CORS**: Worker-level CORS handling

## Ölçeklenebilirlik

- **Serverless**: Otomatik scaling
- **CDN**: Global edge deployment
- **Durable Objects**: Horizontal scaling için unique IDs
- **Stateless Workers**: Request isolation

## Development Workflow

1. **Local Development**: `wrangler dev`
2. **Testing**: Unit tests + integration tests
3. **Deployment**: `wrangler deploy`
4. **Monitoring**: Cloudflare dashboard metrics
