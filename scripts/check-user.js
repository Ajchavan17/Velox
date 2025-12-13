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

async function checkUser() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined');
        }
        console.log('URI:', process.env.MONGODB_URI.substring(0, 20) + '...');

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = process.argv[2];
        if (!email) {
            throw new Error('Please provide an email address');
        }

        const user = await User.findOne({ email });

        if (user) {
            console.log(`User ${email} found.`);
            console.log('ID:', user._id);
            console.log('Plan:', user.plan);
            console.log('Verified:', user.isVerified);
        } else {
            console.log(`User ${email} NOT found.`);
            const allUsers = await User.find({});
            console.log('Total users in DB:', allUsers.length);
            allUsers.forEach(u => console.log(`- ${u.email}`));
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkUser();
