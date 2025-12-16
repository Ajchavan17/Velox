import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function getAuthSession(req?: Request) {
    // 1. Try server session (cookies) - Standard for Web
    const session = await getServerSession(authOptions);
    if (session) return session;

    // 2. Try raw token (Bearer header) - Standard for Mobile
    if (req) {
        try {
            // getToken can read from Authorization header automatically
            const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });

            if (token) {
                // Reconstruct session-like object from token
                // We map token fields back to session.user structure
                return {
                    user: {
                        id: token.id as string,
                        name: token.name,
                        email: token.email,
                        image: token.picture,
                        plan: token.plan as string,
                        subscriptionStatus: token.subscriptionStatus as string
                    }
                };
            }
        } catch (error) {
            console.error("Error verifying bearer token:", error);
        }
    }

    return null;
}
