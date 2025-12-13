const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });
// User model definition is inline below

// Handle default export if necessary (though in this script context, require might behave differently with ES modules source)
// Actually, since User.ts is TS, we can't require it directly in JS without compilation or ts-node.
// I will use a raw mongoose connection and schema definition to avoid TS issues in this quick script.

const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error('MONGODB_URI is not defined');
    process.exit(1);
}

mongoose.connect(uri)
    .then(async () => {
        console.log('Connected to MongoDB');

        // Define a minimal schema to read the user
        const UserSchema = new mongoose.Schema({
            email: String,
            isVerified: Boolean,
            verificationToken: String,
        });

        // Use the existing collection 'users'
        const User = mongoose.models.User || mongoose.model('User', UserSchema);

        const email = 'verify_test_1719876543@example.com';
        const user = await User.findOne({ email });

        if (user) {
            console.log('User found:');
            console.log('Email:', user.email);
            console.log('isVerified:', user.isVerified);
            console.log('Verification Token:', user.verificationToken);
        } else {
            console.log('User not found');
        }

        process.exit(0);
    })
    .catch((err) => {
        console.error('Error:', err);
        process.exit(1);
    });
