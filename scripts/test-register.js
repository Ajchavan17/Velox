async function testRegister() {
    const user = {
        name: 'API Test User',
        email: `api_test_${Date.now()}@example.com`,
        password: 'password123'
    };

    try {
        const res = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });

        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Response:', data);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testRegister();
