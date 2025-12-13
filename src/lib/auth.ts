import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                console.log('Authorize called with:', credentials?.email);
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Please enter an email and password');
                }

                await dbConnect();

                const user = await User.findOne({ email: credentials.email }).select('+password');
                console.log('User found:', user ? 'Yes' : 'No');

                if (!user) {
                    throw new Error('Invalid email or password');
                }

                if (!user.isVerified) {
                    throw new Error('Please verify your email first');
                }

                // CHECK LOCKOUT
                if (user.lockUntil && user.lockUntil > new Date()) {
                    const remaining = Math.ceil((new Date(user.lockUntil).getTime() - Date.now()) / 1000);
                    let timeMsg = `${remaining} seconds`;
                    if (remaining > 60) {
                        const mins = Math.ceil(remaining / 60);
                        timeMsg = `${mins} minutes`;
                    }
                    throw new Error(`Account is locked. Please try again in ${timeMsg}.`);
                }

                const isMatch = await bcrypt.compare(credentials.password, user.password);
                console.log('Password match:', isMatch);

                if (!isMatch) {
                    // HANDLE FAILED ATTEMPT
                    const attempts = (user.failedLoginAttempts || 0) + 1;
                    let update: any = { failedLoginAttempts: attempts };

                    if (attempts >= 3) {
                        const lastDuration = user.lastLockDuration || 0;
                        // If last lock was 1 min (60000ms), next is 5 mins (300000ms), else 1 min
                        const lockDuration = lastDuration === 60000 ? 300000 : 60000;

                        update.lockUntil = new Date(Date.now() + lockDuration);
                        update.lastLockDuration = lockDuration;
                        // Optional: Reset attempts after lock? Or keep them high? 
                        // Plan said: "If >= 3 ... lock". 
                        // If we don't reset attempts, specific logic:
                        // Next time they fail after lock expires, attempts will be 4. so it will lock again immediately.
                        // This seems correct: consecutive failures after lock should trigger lock again.
                    }

                    await User.updateOne({ _id: user._id }, { $set: update });

                    throw new Error('Invalid email or password');
                }

                // LOGIN SUCCESS - RESET LOCKOUT
                if (user.failedLoginAttempts > 0 || user.lockUntil) {
                    await User.updateOne(
                        { _id: user._id },
                        {
                            $set: {
                                failedLoginAttempts: 0,
                                lockUntil: null,
                                lastLockDuration: 0
                            }
                        }
                    );
                }

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    plan: user.plan,
                    subscriptionStatus: user.subscriptionStatus
                };
            },
        }),
    ],
    pages: {
        signIn: '/login',
        error: '/login', // Error code passed in query string as ?error=
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.plan = user.plan;
                token.subscriptionStatus = user.subscriptionStatus;
            }
            if (trigger === "update" && session) {
                token.plan = session.user.plan;
                token.subscriptionStatus = session.user.subscriptionStatus;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.plan = token.plan as string;
                session.user.subscriptionStatus = token.subscriptionStatus as string;
            }
            return session;
        },
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
};
