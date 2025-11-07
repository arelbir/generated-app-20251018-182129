# API Reference - MorFit Studio Suite

Bu dokümantasyon, MorFit Studio Suite'un backend API endpoint'lerini detaylandırır. Tüm API'ler RESTful prensiplerine göre tasarlanmış ve JSON response döner.

## Genel Bilgiler

- **Base URL**: `/api`
- **Authentication**: Henüz uygulanmamış (geliştirme aşamasında)
- **Response Format**:
  ```json
  {
    "success": true,
    "data": { ... },
    "error": null
  }
  ```
- **Error Response**:
  ```json
  {
    "success": false,
    "data": null,
    "error": "Error message"
  }
  ```

## Üye Yönetimi (Members)

### GET /api/members
Üyelerin listesini döner (sayfalandırma ile).

**Query Parameters**:
- `page` (number, optional): Sayfa numarası (default: 0)
- `limit` (number, optional): Sayfa başına öğe sayısı (default: 10)

**Response**:
```json
{
  "success": true,
  "data": {
    "items": [Member[]],
    "totalCount": 150
  }
}
```

### GET /api/members/:id
Belirli bir üyeyi ID ile getirir.

**Response**: `Member` object

### POST /api/members
Yeni üye oluşturur.

**Request Body**:
```json
{
  "fullName": "string",
  "email": "string",
  "phone": "string"
}
```

### PUT /api/members/:id
Üye bilgilerini günceller.

**Request Body**: `Partial<Member>`

## Seans Yönetimi (Sessions)

### GET /api/sessions
Seans listesini getirir (filtreleme ile).

**Query Parameters**:
- `memberId` (string, optional): Üyeye göre filtrele
- `date` (string, optional): Tarihe göre filtrele (ISO 8601)

**Response**: `Session[]`

### POST /api/sessions
Yeni seans oluşturur.

**Request Body**:
```json
{
  "memberId": "string",
  "subDeviceId": "string",
  "startTime": "ISO 8601 string",
  "duration": 30,
  "notes": "optional string"
}
```

## Finansal İşlemler (Financials)

### GET /api/financials/income
Aylık gelir tablosunu getirir.

**Response**: `MonthlyIncomeRow[]`

### GET /api/financials/cashbook
Günlük nakit defterini getirir.

**Response**: `FinancialTransaction[]`

## Raporlar (Reports)

### GET /api/reports/expired-packages
Süresi dolmuş paketleri listeler.

**Response**:
```json
[
  {
    "member": Member,
    "package": Package
  }
]
```

### GET /api/reports/audit-log
Sistem aktivitelerini listeler (zaman damgasına göre sıralı).

**Response**: `AuditLog[]`

## Ayarlar (Settings)

### Cihaz Yönetimi (Devices)

#### GET /api/settings/devices
Tüm cihazları listeler.

#### POST /api/settings/devices
Yeni cihaz oluşturur.

**Request Body**:
```json
{
  "name": "string",
  "quantity": number,
  "measurementFrequency": number | null,
  "requiredSpecializationIds": string[] | undefined
}
```

#### PUT /api/settings/devices/:id
Cihaz bilgilerini günceller.

### Sağlık Koşulları (Health Conditions)

#### GET /api/settings/health-conditions
Sağlık koşulları tanımlarını listeler.

#### POST /api/settings/health-conditions
Yeni sağlık koşulu tanımı oluşturur.

**Request Body**:
```json
{
  "name": "string"
}
```

#### PUT /api/settings/health-conditions/:id
Sağlık koşulu tanımını günceller.

#### DELETE /api/settings/health-conditions/:id
Sağlık koşulu tanımını siler.

### Paket Tanımları (Package Definitions)

#### GET /api/settings/packages
Paket tanımlarını listeler.

#### POST /api/settings/packages
Yeni paket tanımı oluşturur.

**Request Body**:
```json
{
  "name": "string",
  "deviceName": "string",
  "totalSessions": number,
  "price": number,
  "durationDays": number
}
```

#### PUT /api/settings/packages/:id
Paket tanımını günceller.

#### DELETE /api/settings/packages/:id
Paket tanımını siler.

### Personel Yönetimi (Staff)

#### GET /api/settings/staff
Personel listesini getirir.

#### POST /api/settings/staff
Yeni personel ekler.

**Request Body**:
```json
{
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "role": "admin" | "uzman",
  "gender": "Kadın" | "Erkek" | "Diğer",
  "specializationIds": string[] | undefined,
  "workingHours": WorkingHour[],
  "serviceCommissions": ServiceCommission[]
}
```

#### PUT /api/settings/staff/:id
Personel bilgilerini günceller.

#### DELETE /api/settings/staff/:id
Personel kaydını siler.

### Uzmanlıklar (Specializations)

#### GET /api/settings/specializations
Uzmanlık tanımlarını listeler.

#### POST /api/settings/specializations
Yeni uzmanlık tanımı oluşturur.

**Request Body**:
```json
{
  "name": "string"
}
```

#### PUT /api/settings/specializations/:id
Uzmanlık tanımını günceller.

#### DELETE /api/settings/specializations/:id
Uzmanlık tanımını siler.

## Data Types

Detaylı type tanımları için `shared/types.ts` dosyasına bakınız.

## Error Handling

API'ler aşağıdaki HTTP status kodlarını kullanır:
- `200`: Başarılı
- `400`: Bad Request (geçersiz parametreler)
- `404`: Not Found (kaynak bulunamadı)
- `500`: Internal Server Error

## Seed Data

Uygulama ilk çalıştığında mock veriler otomatik olarak yüklenir. Bu veriler geliştirme ve test amaçlıdır.
