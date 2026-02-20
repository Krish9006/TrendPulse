const axios = require('axios');

async function testSignup() {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'Test User',
            email: `test${Date.now()}@example.com`,
            password: 'password123'
        });
        console.log('Success:', res.data);
    } catch (err) {
        console.error('Error Status:', err.response?.status);
        console.error('Error Data:', err.response?.data);
    }
}

testSignup();
