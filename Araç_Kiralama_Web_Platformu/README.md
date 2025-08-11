# 🚗 Rentify - Premium Araç Kiralama Platformu

**Türkiye'nin en güvenilir ve premium araç kiralama platformu.** Lüks araçlardan ekonomik modellere kadar geniş filomuzla hizmetinizdeyiz.

## 📸 Screenshots

### 🏠 Ana Sayfa (Homepage)
![Ana Sayfa](/screenshots/anasayfa.jpg)
*Ana sayfa - Hero section ve öne çıkan araçlar*

### 🚗 Araçlar Sayfası (Vehicles Page)
![Araçlar Sayfası](/screenshots/araçlarkısmı.jpg)
*Araç listesi ve filtreleme sistemi*

### 🚙 Araç Detay Sayfası (Vehicle Detail)
![Araç Detay](/screenshots/detaylarkısmı.jpg)
*BMW X5 detay sayfası - Özellikler ve kiralama*

### 💬 Yorum Sistemi (Review System)
![Yorum Sistemi](/screenshots/yorumlarkısmı.jpg)
*Kullanıcı yorumları ve yanıt sistemi*

### 👨‍💼 Admin Paneli (Admin Panel)
![Admin Panel](/screenshots/adminpanelkısmı.jpg)
*Yönetim paneli - Kiralama talepleri*

### 🚗 Araç Yönetimi (Vehicle Management)
![Araç Yönetimi](/screenshots/araçyönetimkısmı.jpg)
*Admin araç yönetimi ve istatistikler*

### 👥 Kullanıcı Yönetimi (User Management)
![Kullanıcı Yönetimi](/screenshots/kullnıclarkısmı.jpg)
*Kullanıcı listesi ve rol yönetimi*

### 📋 Rezervasyon Yönetimi (Reservation Management)
![Rezervasyon Yönetimi](/screenshots/rezervayonkısmı.jpg)
*Rezervasyon takibi ve durum yönetimi*

### 💬 Yorum Yönetimi (Comment Management)
![Yorum Yönetimi](/screenshots/yorumyönetimkısmı.jpg)
*Admin yorum yönetimi ve yanıtlar*

### 🔐 Admin Giriş (Admin Login)
![Admin Giriş](/screenshots/admingirişkısmı.jpg)
*Güvenli admin giriş ekranı*

### 👤 Profil Sayfası (Profile Page)
![Profil Sayfası](/screenshots/profilkısmı.jpg)
*Kullanıcı profili ve mesajlar*

### 📝 Form Doldurma (Form Filling)
![Form Doldurma](/screenshots/formkısmı.jpg)
*Kiralama formu - Kişisel bilgiler*

### 📅 Kiralama Detayları (Rental Details)
![Kiralama Detayları](/screenshots/kiralamakısmı.jpg)
*Kiralama tarihleri ve fiyat özeti*

### ✅ Form Gönderimi (Form Submission)
![Form Gönderimi](/screenshots/formbilgisikısmı.jpg)
*Form başarıyla gönderildi onayı*

### 🎉 Kiralama Başarılı (Rental Success)
![Kiralama Başarılı](/screenshots/başarılıkiralama.jpg)
*Kiralama işlemi tamamlandı onayı*

### 🔍 Giriş Modal (Sign In Modal)
![Giriş Modal](/screenshots/girişkısmı.jpg)
*Kullanıcı giriş modal'ı*

### 📱 Responsive Tasarım (Mobile Design)
![Responsive Tasarım](/screenshots/responsivtasarım.jpg)
*Mobil uyumlu tasarım*

## ✨ Özellikler

- 🚗 **Araç Kiralama** - Geniş araç filosu
- 👥 **Kullanıcı Yönetimi** - Güvenli profil sistemi
- 💬 **Yorum & Yanıt Sistemi** - Kullanıcı deneyimleri
- 🌙 **Dark Mode** - Modern tema desteği
- 📱 **Responsive Tasarım** - Mobil uyumlu
- 🔐 **Güvenli Kimlik Doğrulama** - Clerk entegrasyonu
- 👨‍💼 **Admin Paneli** - Kapsamlı yönetim

## 🚀 Kurulum ve Çalıştırma

### 📋 Gereksinimler

- **Node.js** (v18 veya üzeri)
- **pnpm** (v8 veya üzeri)
- **PostgreSQL** veritabanı
- **Git**

### 🔧 Kurulum Adımları

#### 1. Projeyi Klonlayın
```bash
git clone https://github.com/SerdarSahinn/rentify-car-rental-platform-.git
cd rentify-car-rental-platform-
```

#### 2. Bağımlılıkları Yükleyin
```bash
# Root dizinde
pnpm install

# Server bağımlılıkları
cd apps/server
pnpm install

# Client bağımlılıkları
cd ../client
pnpm install
```

#### 3. Veritabanı Kurulumu
```bash
# Server dizininde
cd apps/server

# Prisma migration
pnpm prisma migrate dev

# Veritabanı seed (opsiyonel)
pnpm prisma db seed
```

#### 4. Environment Variables
```bash
# Root dizinde .env dosyası oluşturun
cp .env.example .env

# Gerekli değişkenleri doldurun:
# - DATABASE_URL
# - CLERK_SECRET_KEY
# - CLERK_PUBLISHABLE_KEY
```

#### 5. Uygulamayı Çalıştırın

**ÖNEMLİ: Önce server, sonra client çalıştırın!**

```bash
# Terminal 1: Server'ı başlatın
cd apps/server
pnpm dev

# Terminal 2: Client'ı başlatın (yeni terminal açın)
cd apps/client
pnpm dev
```

### 🌐 Erişim URL'leri

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3001
- **Admin Panel:** http://localhost:5173/admin
- **API Docs:** http://localhost:3001/health

## 🛠️ Kullanılan Teknolojiler

### 🎯 Frontend (Client)

#### **React + TypeScript**
- **Kullanım:** Ana UI framework, tip güvenliği
- **Konum:** `apps/client/src/`
- **Özellik:** Modern React hooks, TypeScript interfaces

#### **Tailwind CSS**
- **Kullanım:** Styling ve responsive tasarım
- **Konum:** `apps/client/src/index.css`
- **Özellik:** Utility-first CSS, dark mode desteği

#### **React Query (TanStack Query)**
- **Kullanım:** Server state yönetimi, API çağrıları
- **Konum:** `apps/client/src/services/`
- **Özellik:** Caching, background updates, error handling

#### **React Router**
- **Kullanım:** Sayfa yönlendirme ve routing
- **Konum:** `apps/client/src/App.tsx`
- **Özellik:** Nested routes, protected routes

#### **Clerk Authentication**
- **Kullanım:** Kullanıcı kimlik doğrulama
- **Konum:** `apps/client/src/hooks/useAuth.ts`
- **Özellik:** JWT tokens, user management

### 🔧 Backend (Server)

#### **Node.js + Express**
- **Kullanım:** REST API server
- **Konum:** `apps/server/src/index.ts`
- **Özellik:** Middleware, route handling

#### **TypeScript**
- **Kullanım:** Backend tip güvenliği
- **Konum:** `apps/server/src/`
- **Özellik:** Interface definitions, type safety

#### **Prisma ORM**
- **Kullanım:** Veritabanı işlemleri
- **Konum:** `apps/server/prisma/`
- **Özellik:** Database schema, migrations, queries

#### **PostgreSQL**
- **Kullanım:** Ana veritabanı
- **Konum:** Database server
- **Özellik:** Relational data, ACID compliance

#### **JWT Authentication**
- **Kullanım:** API güvenliği
- **Konum:** `apps/server/src/middleware/`
- **Özellik:** Token validation, protected routes

### 🎨 UI/UX Bileşenleri

#### **Lucide React Icons**
- **Kullanım:** Modern icon set
- **Konum:** Tüm component'lerde
- **Özellik:** Scalable vector icons

#### **Custom Components**
- **Kullanım:** Yeniden kullanılabilir UI bileşenleri
- **Konum:** `apps/client/src/components/`
- **Özellik:** ThemeToggle, ReplyComponent, ReviewComponent

### 🌙 Dark Mode Sistemi

#### **Theme Context**
- **Kullanım:** Global tema yönetimi
- **Konum:** `apps/client/src/contexts/ThemeContext.tsx`
- **Özellik:** Light/Dark/System tema desteği

#### **CSS Variables**
- **Kullanım:** Dinamik renk değişimi
- **Konum:** `apps/client/src/index.css`
- **Özellik:** Smooth transitions, consistent theming

## 📁 Proje Yapısı

```
rentify-car-rental-platform/
├── apps/
│   ├── client/                 # Frontend React uygulaması
│   │   ├── src/
│   │   │   ├── components/     # UI bileşenleri
│   │   │   ├── pages/         # Sayfa component'leri
│   │   │   ├── services/      # API servisleri
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   ├── contexts/      # React contexts
│   │   │   └── types/         # TypeScript type definitions
│   │   └── package.json
│   └── server/                 # Backend Node.js uygulaması
│       ├── src/
│       │   ├── modules/        # Feature modules
│       │   ├── middleware/     # Express middleware
│       │   └── index.ts        # Server entry point
│       ├── prisma/             # Database schema & migrations
│       └── package.json
├── package.json                 # Root package.json
└── README.md                   # Bu dosya
```

## 🔐 Güvenlik Özellikleri

- **JWT Token Authentication**
- **Clerk Identity Management**
- **Protected API Routes**
- **Input Validation**
- **SQL Injection Protection**

## 🚀 Deployment

### **Frontend (Vercel/Netlify)**
```bash
cd apps/client
pnpm build
# dist/ klasörünü deploy edin
```

### **Backend (Railway/Render)**
```bash
cd apps/server
pnpm build
# Environment variables'ları ayarlayın
```

