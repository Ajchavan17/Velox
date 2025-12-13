async function createUser() {
    const user = {
        name: 'Manual Test User',
        email: 'manual_test_user@example.com',
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

createUser();
