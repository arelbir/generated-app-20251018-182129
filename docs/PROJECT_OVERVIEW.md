# MorFit Studio Suite - Proje Genel Bakışı

## Proje Açıklaması
MorFit Studio Suite, modern fitness salonları için kapsamlı bir yönetim platformudur. Seans planlama, üye yönetimi, finansal takip ve raporlama gibi günlük operasyonları kolaylaştırmak için tasarlanmıştır. Uygulama, mobil-first yaklaşımıyla geliştirilmiş, yüksek performanslı ve kullanıcı dostu bir arayüz sunar.

## Ana Özellikler
- **📅 Gerçek Zamanlı Seans Gösterge Paneli**: Etkileşimli takvim tabanlı seans planlama (Vacu, Roll gibi cihazlar için)
- **👥 Kapsamlı Üye Yönetimi**: Demo'dan tam üyeliğe kadar üye profilleri, sağlık koşulları, vücut ölçümleri
- **💰 Finansal Yönetim**: Aylık gelir tablosu ve günlük nakit defteri
- **📦 Paket ve Cihaz Yönetimi**: Hizmetler, paketler ve salon ekipmanlarının konfigürasyonu
- **📊 Raporlama ve Denetim İzleri**: Tüm sistem aktivitelerini takip, süresi dolmuş paketleri görüntüleme
- **✨ Modern UI/UX**: Shadcn/UI ile minimalist tasarım, smooth animasyonlar

## Teknoloji Yığını
- **Frontend**: React, Vite, TypeScript, React Router
- **UI Kütüphaneleri**: Tailwind CSS, Shadcn/UI, Framer Motion, Lucide React
- **State Yönetimi**: Zustand
- **Backend**: Cloudflare Workers, Hono framework
- **Veri Depolama**: Cloudflare Durable Objects
- **Dağıtım**: Cloudflare

## Proje Yapısı
```
generated-app-20251018-182129/
├── src/                          # Frontend uygulaması
│   ├── components/               # Yeniden kullanılabilir UI bileşenleri
│   ├── pages/                    # Sayfa bileşenleri (Dashboard, Members, vb.)
│   ├── hooks/                    # Özel React hook'ları
│   ├── lib/                      # Yardımcı fonksiyonlar
│   └── stores/                   # Zustand state store'ları
├── worker/                       # Cloudflare Worker backend
│   ├── core-utils.ts             # Temel yardımcı fonksiyonlar
│   ├── entities.ts               # Durable Object entity tanımları
│   └── user-routes.ts            # API endpoint'leri
├── shared/                       # Frontend/Backend arası paylaşılan kod
│   ├── types.ts                  # TypeScript type tanımları
│   └── mock-data.ts              # Mock veri seti
├── docs/                         # Proje dokümantasyonu
└── public/                       # Statik dosyalar
```

## Veri Modelleri
- **Member**: Üye bilgileri (ad, email, telefon, üyelik durumu, sağlık koşulları, vücut ölçümleri, aktif paketler)
- **Package**: Paket bilgileri (ad, cihaz adı, başlangıç/bitiş tarihi, toplam/kalan seans sayısı)
- **Session**: Seans rezervasyonları (üye ID, cihaz ID, başlangıç zamanı, süre, durum)
- **Device**: Salon cihazları (ad, miktar, alt cihazlar, uzmanlık gereksinimleri)
- **Staff**: Personel bilgileri (ad, rol, uzmanlıklar, çalışma saatleri, komisyon oranları)
- **FinancialTransaction**: Finansal işlemler (tarih, tip, miktar, açıklama)
- **AuditLog**: Sistem aktiviteleri logları

## Geliştirme Ortamı Kurulumu
1. Node.js v18+, Bun package manager, Wrangler CLI gerekli
2. `bun install` ile bağımlılıkları yükle
3. `wrangler dev` ile lokal geliştirme sunucusunu başlat
4. Uygulama http://localhost:8788 adresinde çalışır

## Dağıtım
- Cloudflare'a otomatik dağıtım için GitHub repository'sini bağla
- `bun run deploy` komutu ile manuel dağıtım

## Güvenlik ve Performans
- Serverless mimari ile yüksek ölçeklenebilirlik
- TypeScript ile type safety
- Cloudflare'ın küresel CDN altyapısı
- Durable Objects ile stateful veri saklama
