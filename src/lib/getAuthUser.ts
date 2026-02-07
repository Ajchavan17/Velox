import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';

export async function getAuthUser(req: Request) {
    // 1. Try NextAuth Session (Web)
    const session = await getServerSession(authOptions);
    if (session?.user) {
        return session.user;
    }

    // 2. Try JWT Header (Mobile)
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            console.log('[Auth] Verifying Token:', token.substring(0, 10) + '...');
            const decoded: any = jwt.verify(token, JWT_SECRET);
            console.log('[Auth] Token Verified for User:', decoded.email);
            return {
                id: decoded.id,
                email: decoded.email,
                // Add other fields if encoded in JWT or fetch from DB if critical
            };
        } catch (err) {
            console.error('JWT Verification failed:', err);
            return null;
        }
    }

    return null;
}
