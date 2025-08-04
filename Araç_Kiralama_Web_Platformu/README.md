# 🚗 Rentify - Araç Kiralama Web Platformu

Profesyonel seviyede, ölçeklenebilir araç kiralama web platformu.

## 🏗️ Mimari

- **Frontend**: React + Vite + TailwindCSS + Clerk Auth
- **Backend**: Node.js + Express.js + Prisma + PostgreSQL
- **Gerçek Zamanlı**: Socket.IO
- **Ödeme**: Stripe
- **AI**: OpenAI GPT
- **Arama**: Elasticsearch
- **Harita**: Google Maps API

## 🚀 Başlangıç

### Gereksinimler

- Node.js 18+
- PostgreSQL
- pnpm (önerilen)

### Kurulum

1. **Projeyi klonlayın**
```bash
git clone <repository-url>
cd rentify-platform
```

2. **Bağımlılıkları yükleyin**
```bash
pnpm install
```

3. **Environment dosyasını oluşturun**
```bash
cp env.example .env
```

4. **Veritabanını kurun**
```bash
# PostgreSQL'de veritabanı oluşturun
createdb rentify_db

# Prisma migration'ları çalıştırın
pnpm db:migrate

# Seed verilerini yükleyin
pnpm db:seed
```

5. **Backend'i başlatın**
```bash
pnpm dev
```

## 📁 Proje Yapısı

```
rentify-platform/
├── apps/
│   ├── client/          # React Frontend
│   └── server/          # Express Backend
├── packages/
│   ├── ui/              # Paylaşımlı UI bileşenleri
│   └── utils/           # Ortak yardımcı fonksiyonlar
├── prisma/
│   └── schema.prisma    # Veritabanı şeması
└── README.md
```

## 🔧 Geliştirme

### Backend Geliştirme

```bash
cd apps/server
pnpm dev          # Development server
pnpm build        # Production build
pnpm test         # Testleri çalıştır
```

### Frontend Geliştirme

```bash
cd apps/client
pnpm dev          # Development server
pnpm build        # Production build
pnpm test         # Testleri çalıştır
```

## 🗄️ Veritabanı

### Migration'lar

```bash
pnpm db:migrate   # Yeni migration oluştur
pnpm db:generate  # Prisma client'ı güncelle
pnpm db:studio    # Prisma Studio'yu aç
```

### Seed Verileri

```bash
pnpm db:seed      # Test verilerini yükle
```

## 🔐 Environment Değişkenleri

Gerekli environment değişkenlerini `.env` dosyasında tanımlayın:

- `DATABASE_URL`: PostgreSQL bağlantı URL'i
- `CLERK_SECRET_KEY`: Clerk authentication secret key
- `STRIPE_SECRET_KEY`: Stripe payment secret key
- `OPENAI_API_KEY`: OpenAI API key
- `GOOGLE_MAPS_API_KEY`: Google Maps API key

## 🧪 Test

```bash
# Backend testleri
cd apps/server && pnpm test

# Frontend testleri
cd apps/client && pnpm test

# E2E testleri
pnpm test:e2e
```

## 📦 Deployment

### Backend (Railway)

```bash
# Railway CLI ile deploy
railway login
railway link
railway up
```

### Frontend (Vercel)

```bash
# Vercel CLI ile deploy
vercel login
vercel --prod
```

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🆘 Destek

Sorularınız için issue açabilir veya [email@example.com](mailto:email@example.com) adresine yazabilirsiniz. 