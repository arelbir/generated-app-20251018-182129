# Component Library - MorFit Studio Suite

Bu dokümantasyon, MorFit Studio Suite'un React bileşen kütüphanesini detaylandırır. Bileşenler Shadcn/UI üzerine inşa edilmiş ve Tailwind CSS ile stillendirilmiştir.

## Genel Yapı

```
src/components/
├── ui/                    # Shadcn/UI temel bileşenler
├── layout/                # Layout bileşenleri
├── *.tsx                  # Sayfa spesifik bileşenler
└── *-dialog.tsx           # Modal dialog'lar
```

## UI Bileşenleri (shadcn/ui)

### Button
Standart button bileşeni.

```tsx
<Button variant="default" size="sm">Click me</Button>
```

**Props**:
- `variant`: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
- `size`: "default" | "sm" | "lg" | "icon"

### Input
Form input bileşeni.

```tsx
<Input placeholder="Email" type="email" />
```

### Card
İçerik kapsayıcısı.

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

### Dialog
Modal dialog sistemi.

```tsx
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    Content
  </DialogContent>
</Dialog>
```

### Table
Veri tablosu bileşeni (TanStack Table ile birlikte kullanılır).

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Column</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Data</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

## Sayfa Spesifik Bileşenler

### BookingDialog
Seans rezervasyonu için dialog.

**Props**:
- `member`: Member (optional)
- `device`: Device (optional)
- `onSuccess`: () => void

### EditMemberDialog
Üye düzenleme dialog'u.

**Props**:
- `member`: Member | null
- `open`: boolean
- `onOpenChange`: (open: boolean) => void
- `onSuccess`: () => void

### NewMemberDialog
Yeni üye oluşturma dialog'u.

**Props**:
- `open`: boolean
- `onOpenChange`: (open: boolean) => void
- `onSuccess`: () => void

### PackageDialog
Paket oluşturma/düzenleme dialog'u.

**Props**:
- `memberId`: string
- `package`: Package | null
- `open`: boolean
- `onOpenChange`: (open: boolean) => void
- `onSuccess`: () => void

### StaffDialog
Personel oluşturma/düzenleme dialog'u.

**Props**:
- `staff`: Staff | null
- `open`: boolean
- `onOpenChange`: (open: boolean) => void
- `onSuccess`: () => void

## Layout Bileşenleri

### app-sidebar.tsx
Ana sidebar navigasyonu.

**Özellikler**:
- Responsive tasarım
- Navigation menu
- Theme toggle

## Hook'lar ve Utilities

### Özel Hook'lar (src/hooks/)
- `useMembers`: Üye verilerini yönetir
- `useSessions`: Seans verilerini yönetir
- `useDevices`: Cihaz verilerini yönetir

### Utility Fonksiyonları (src/lib/)
- Form validation (Zod schemas)
- Date formatting
- API client helpers

## State Management

### Zustand Stores (src/stores/)
- `useMemberStore`: Üye state yönetimi
- `useSessionStore`: Seans state yönetimi
- `useDeviceStore`: Cihaz state yönetimi

**Kullanım Örneği**:
```tsx
import { useMemberStore } from '@/stores/member-store'

function MyComponent() {
  const { members, fetchMembers } = useMemberStore()
  // ...
}
```

## Form Yönetimi

React Hook Form + Zod validation kullanılır.

**Örnek**:
```tsx
const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email')
})

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema)
})
```

## Tema Sistemi

next-themes ile dark/light mode desteği.

```tsx
import { useTheme } from 'next-themes'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <Button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </Button>
  )
}
```

## Animasyonlar

Framer Motion ile smooth animasyonlar.

**Örnek**:
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

## Responsive Tasarım

Tailwind CSS responsive utilities kullanılır.

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Responsive grid */}
</div>
```

## Accessibility

- Shadcn/UI bileşenleri ARIA compliant
- Keyboard navigation desteği
- Screen reader desteği
- Focus management

## Performans Optimizasyonları

- React.lazy ile code splitting
- TanStack Query ile caching
- Virtual scrolling büyük listeler için
- Memoization (React.memo, useMemo, useCallback)
