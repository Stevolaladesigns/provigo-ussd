import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';

export async function POST() {
    const email = 'provigogh@gmail.com';
    const password = 'Vigo@2006';

    try {
        // Check if user already exists
        try {
            const existingUser = await adminAuth.getUserByEmail(email);
            return NextResponse.json({
                message: 'Admin account already exists',
                uid: existingUser.uid,
            });
        } catch {
            // User doesn't exist, proceed to create
        }

        // Create the admin user
        const user = await adminAuth.createUser({
            email,
            password,
            displayName: 'ProviGO Admin',
            emailVerified: true,
        });

        // Set admin claim
        await adminAuth.setCustomUserClaims(user.uid, { admin: true });

        return NextResponse.json({
            message: 'Admin account created successfully',
            uid: user.uid,
            email,
        });
    } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error('Seed admin error:', errMsg);
        return NextResponse.json(
            { error: 'Failed to create admin account', details: errMsg },
            { status: 500 }
        );
    }
}

// Also allow GET for easy browser testing
export async function GET() {
    return POST();
}
