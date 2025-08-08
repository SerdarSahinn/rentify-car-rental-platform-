const axios = require('axios');

async function testBooking() {
  try {
    console.log('🔍 Booking API test başlıyor...');
    
    // Test booking data
    const bookingData = {
      vehicleId: 'test-vehicle-id',
      startDate: '2026-10-08',
      endDate: '2026-10-09',
      notes: 'Test booking',
      userEmail: 'test@example.com'
    };
    
    console.log('🔍 Test booking data:', bookingData);
    
    // API çağrısı
    const response = await axios.post('http://localhost:3001/api/bookings', bookingData, {
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ API response:', response.data);
    
  } catch (error) {
    console.error('❌ API error:', error.response?.data || error.message);
    console.error('❌ Status:', error.response?.status);
    console.error('❌ Headers:', error.response?.headers);
  }
}

testBooking();
