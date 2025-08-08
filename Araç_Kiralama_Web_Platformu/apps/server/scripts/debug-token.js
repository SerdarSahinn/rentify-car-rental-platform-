const jwt = require('jsonwebtoken');

// Test token'ı (gerçek bir Clerk token'ı buraya koyun)
const testToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...'; // Buraya gerçek token gelecek

function debugToken(token) {
  try {
    console.log('🔍 Token debug başlıyor...');
    console.log('🔍 Token:', token.substring(0, 50) + '...');
    
    const decoded = jwt.decode(token);
    console.log('\n📋 Decoded token içeriği:');
    console.log(JSON.stringify(decoded, null, 2));
    
    console.log('\n🔍 Önemli alanlar:');
    console.log('  - sub (clerkId):', decoded?.sub);
    console.log('  - email:', decoded?.email);
    console.log('  - email_verified:', decoded?.email_verified);
    console.log('  - name:', decoded?.name);
    console.log('  - given_name:', decoded?.given_name);
    console.log('  - family_name:', decoded?.family_name);
    
    // Email'i bulmaya çalış
    let email = decoded?.email;
    if (!email) {
      console.log('\n❌ Token\'da email bulunamadı!');
      console.log('🔍 Alternatif email alanları:');
      console.log('  - email_addresses:', decoded?.email_addresses);
      console.log('  - primary_email_address:', decoded?.primary_email_address);
    } else {
      console.log('\n✅ Email bulundu:', email);
    }
    
  } catch (error) {
    console.error('❌ Token decode hatası:', error);
  }
}

// Kullanım için:
// debugToken('BURAYA_GERCEK_TOKEN_GELECEK');

console.log('🔧 Token debug script hazır!');
console.log('📝 Kullanım: debugToken("gerçek_token")');
