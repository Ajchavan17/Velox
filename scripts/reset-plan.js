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

async function resetPlan() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = process.argv[2];
        if (!email) {
            throw new Error('Please provide an email address');
        }

        const user = await User.findOneAndUpdate(
            { email },
            { plan: null, subscriptionStatus: null },
            { new: true }
        );

        if (user) {
            console.log(`User ${email} plan reset successfully.`);
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

resetPlan();
