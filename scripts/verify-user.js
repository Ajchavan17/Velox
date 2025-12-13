const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    isVerified: Boolean,
    plan: String,
    subscriptionStatus: String
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function verifyUser() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = process.argv[2] || 'ajchavan05@gmail.com';
        const user = await User.findOneAndUpdate(
            { email },
            { isVerified: true },
            { new: true }
        );

        if (user) {
            console.log(`User ${email} verified successfully.`);
            console.log('Plan:', user.plan);
        } else {
            console.log(`User ${email} not found.`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

verifyUser();
