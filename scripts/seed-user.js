const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: {
        type: String,
        select: true,
    },
    isVerified: Boolean,
    plan: String,
    subscriptionStatus: String,
    image: String,
    provider: String,
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedUser() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = process.argv[2] || 'testuser@example.com';
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 12);

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            console.log(`User ${email} already exists. Updating...`);
            user.password = hashedPassword;
            user.isVerified = true;
            user.plan = null;
            user.subscriptionStatus = null;
            await user.save();
        } else {
            console.log(`Creating new user ${email}...`);
            user = await User.create({
                name: 'Test User',
                email,
                password: hashedPassword,
                isVerified: true,
                plan: null,
                subscriptionStatus: null,
                provider: 'credentials'
            });
        }

        console.log(`User ${email} seeded successfully.`);
        console.log('Plan:', user.plan);
        console.log('Verified:', user.isVerified);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

seedUser();
