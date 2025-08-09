# 🧪 Rentify Backend Test Suite

## 📋 Test Türleri

### Unit Tests
- **booking.service.test.ts**: BookingService fonksiyonları
- **payment.service.test.ts**: PaymentService fonksiyonları  
- **auth.middleware.test.ts**: Authentication middleware

### Integration Tests
- **booking.integration.test.ts**: Booking API endpoints

## 🚀 Test Çalıştırma

### Tek Seferlik Test
```bash
cd apps/server
npm test
```

### Watch Mode (Geliştirme)
```bash
npm run test:watch
```

### Coverage Raporu
```bash
npm run test:coverage
```

## 📊 Test Coverage Hedefleri

- **Functions**: %80+
- **Lines**: %80+  
- **Branches**: %70+
- **Statements**: %80+

## 🔧 Test Konfigürasyonu

- **Test Framework**: Jest
- **Test Environment**: Node.js
- **Mock Framework**: Jest Mocks
- **Database**: In-memory SQLite

## 📝 Test Yazma Kuralları

1. **Arrange-Act-Assert** pattern kullan
2. **Descriptive test names** (Türkçe açıklayıcı isimler)
3. **Mock external dependencies** (Dış bağımlılıkları mock'la)
4. **Test isolation** (Her test bağımsız olmalı)
5. **Edge cases** (Sınır durumları test et)

## 🎯 Test Senaryoları

### Booking Service
- ✅ Booking oluşturma
- ✅ Availability kontrolü
- ✅ Status güncelleme
- ✅ Notification gönderme
- ✅ Error handling

### Payment Service  
- ✅ Payment oluşturma
- ✅ Status güncelleme
- ✅ Webhook handling
- ✅ Error scenarios

### Auth Middleware
- ✅ Token validation
- ✅ User creation
- ✅ Admin authorization
- ✅ Error responses

## 🐛 Test Debugging

### Jest Debug
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

### VS Code Debug
1. Breakpoint koy
2. F5 ile debug başlat
3. Jest Debug configuration seç

## 📈 Test Metrikleri

Coverage raporu `coverage/` klasöründe:
- `lcov-report/index.html`: HTML rapor
- `coverage-final.json`: JSON rapor
- `lcov.info`: LCOV format
