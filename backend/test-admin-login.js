import fetch from 'node-fetch';

const testAdminLogin = async () => {
  try {
    console.log('Testing admin login...');
    
    // Login as admin
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@admin.com',
        password: 'admin123'
      })
    });
    
    console.log('Login response status:', loginResponse.status);
    
    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.error('Login failed:', errorText);
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('Login successful:', loginData.success);
    console.log('User role:', loginData.user.role);
    
    const token = loginData.token;
    console.log('Token received:', token ? 'Yes' : 'No');
    
    // Test admin dashboard with token
    console.log('\nTesting admin dashboard...');
    const dashboardResponse = await fetch('http://localhost:3001/api/admin/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Dashboard response status:', dashboardResponse.status);
    
    if (!dashboardResponse.ok) {
      const errorText = await dashboardResponse.text();
      console.error('Dashboard failed:', errorText);
      return;
    }
    
    const dashboardData = await dashboardResponse.json();
    console.log('Dashboard successful:', dashboardData.success);
    console.log('Stats:', dashboardData.stats);
    console.log('Recent users count:', dashboardData.recentActivity?.users?.length || 0);
    console.log('Recent matches count:', dashboardData.recentActivity?.matches?.length || 0);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
};

testAdminLogin(); 