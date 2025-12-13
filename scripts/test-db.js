const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
console.log('Testing connection to:', uri ? uri.replace(/:([^:@]+)@/, ':****@') : 'undefined');

if (!uri) {
    console.error('MONGODB_URI is not defined');
    process.exit(1);
}

mongoose.connect(uri)
    .then(() => {
        console.log('Successfully connected to MongoDB');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Connection failed:', err.message);
        process.exit(1);
    });
