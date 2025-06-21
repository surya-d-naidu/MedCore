// Simple test script to verify backend-frontend integration
const testBackendConnection = async () => {
  const baseUrl = 'http://localhost:5000';
  
  console.log('🧪 Testing Backend-Frontend Integration...\n');
  
  try {
    // Test 1: Check if server is running
    console.log('1. Testing server connectivity...');
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    if (healthResponse.ok) {
      console.log('✅ Server is running');
    } else {
      console.log('❌ Server is not responding properly');
    }
    
    // Test 2: Test authentication endpoints
    console.log('\n2. Testing authentication endpoints...');
    const loginResponse = await fetch(`${baseUrl}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      }),
      credentials: 'include'
    });
    
    if (loginResponse.ok) {
      console.log('✅ Login endpoint working');
      const cookies = loginResponse.headers.get('set-cookie');
      if (cookies) {
        console.log('✅ Session cookies set');
      }
    } else {
      console.log('❌ Login endpoint failed');
      const errorText = await loginResponse.text();
      console.log('   Error:', errorText);
    }
    
    // Test 3: Test protected endpoints
    console.log('\n3. Testing protected endpoints...');
    const patientsResponse = await fetch(`${baseUrl}/api/patients`, {
      credentials: 'include'
    });
    
    if (patientsResponse.ok) {
      const patients = await patientsResponse.json();
      console.log(`✅ Patients endpoint working - Found ${patients.length} patients`);
    } else {
      console.log('❌ Patients endpoint failed');
      const errorText = await patientsResponse.text();
      console.log('   Error:', errorText);
    }
    
    // Test 4: Test doctors endpoint
    const doctorsResponse = await fetch(`${baseUrl}/api/doctors`, {
      credentials: 'include'
    });
    
    if (doctorsResponse.ok) {
      const doctors = await doctorsResponse.json();
      console.log(`✅ Doctors endpoint working - Found ${doctors.length} doctors`);
    } else {
      console.log('❌ Doctors endpoint failed');
      const errorText = await doctorsResponse.text();
      console.log('   Error:', errorText);
    }
    
    // Test 5: Test appointments endpoint
    const appointmentsResponse = await fetch(`${baseUrl}/api/appointments`, {
      credentials: 'include'
    });
    
    if (appointmentsResponse.ok) {
      const appointments = await appointmentsResponse.json();
      console.log(`✅ Appointments endpoint working - Found ${appointments.length} appointments`);
    } else {
      console.log('❌ Appointments endpoint failed');
      const errorText = await appointmentsResponse.text();
      console.log('   Error:', errorText);
    }
    
    // Test 6: Test dashboard stats
    const statsResponse = await fetch(`${baseUrl}/api/dashboard/stats`, {
      credentials: 'include'
    });
    
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log('✅ Dashboard stats endpoint working');
      console.log('   Stats:', stats);
    } else {
      console.log('❌ Dashboard stats endpoint failed');
      const errorText = await statsResponse.text();
      console.log('   Error:', errorText);
    }
    
    // Test 7: Test medical records endpoint
    const recordsResponse = await fetch(`${baseUrl}/api/medical-records`, {
      credentials: 'include'
    });
    
    if (recordsResponse.ok) {
      const records = await recordsResponse.json();
      console.log(`✅ Medical records endpoint working - Found ${records.length} records`);
    } else {
      console.log('❌ Medical records endpoint failed');
      const errorText = await recordsResponse.text();
      console.log('   Error:', errorText);
    }
    
    // Test 8: Test prescriptions endpoint
    const prescriptionsResponse = await fetch(`${baseUrl}/api/prescriptions`, {
      credentials: 'include'
    });
    
    if (prescriptionsResponse.ok) {
      const prescriptions = await prescriptionsResponse.json();
      console.log(`✅ Prescriptions endpoint working - Found ${prescriptions.length} prescriptions`);
    } else {
      console.log('❌ Prescriptions endpoint failed');
      const errorText = await prescriptionsResponse.text();
      console.log('   Error:', errorText);
    }
    
    // Test 9: Test wards endpoint
    const wardsResponse = await fetch(`${baseUrl}/api/wards`, {
      credentials: 'include'
    });
    
    if (wardsResponse.ok) {
      const wards = await wardsResponse.json();
      console.log(`✅ Wards endpoint working - Found ${wards.length} wards`);
    } else {
      console.log('❌ Wards endpoint failed');
      const errorText = await wardsResponse.text();
      console.log('   Error:', errorText);
    }
    
    // Test 10: Test rooms endpoint
    const roomsResponse = await fetch(`${baseUrl}/api/rooms`, {
      credentials: 'include'
    });
    
    if (roomsResponse.ok) {
      const rooms = await roomsResponse.json();
      console.log(`✅ Rooms endpoint working - Found ${rooms.length} rooms`);
    } else {
      console.log('❌ Rooms endpoint failed');
      const errorText = await roomsResponse.text();
      console.log('   Error:', errorText);
    }
    
    // Test 11: Test bills endpoint
    const billsResponse = await fetch(`${baseUrl}/api/bills`, {
      credentials: 'include'
    });
    
    if (billsResponse.ok) {
      const bills = await billsResponse.json();
      console.log(`✅ Bills endpoint working - Found ${bills.length} bills`);
    } else {
      console.log('❌ Bills endpoint failed');
      const errorText = await billsResponse.text();
      console.log('   Error:', errorText);
    }
    
    console.log('\n🎉 Integration test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testBackendConnection(); 