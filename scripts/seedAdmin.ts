// Admin Account Seeder Script
// Run with: npx ts-node --skip-project scripts/seedAdmin.ts
// Or: npx tsx scripts/seedAdmin.ts

// This script creates the default admin account in Firebase Auth
// Email: provigogh@gmail.com
// Password: Vigo@2006

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountKey || serviceAccountKey === '{}') {
    console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY environment variable not set.');
    console.error('Please set it to your Firebase service account JSON.');
    process.exit(1);
}

const app = initializeApp({
    credential: cert(JSON.parse(serviceAccountKey)),
});

const auth = getAuth(app);

async function seedAdmin() {
    const email = 'provigogh@gmail.com';
    const password = 'Vigo@2006';

    try {
        // Check if user already exists
        const existingUser = await auth.getUserByEmail(email).catch(() => null);

        if (existingUser) {
            console.log('✅ Admin account already exists:', existingUser.uid);
            return;
        }

        // Create the admin user
        const user = await auth.createUser({
            email,
            password,
            displayName: 'ProviGO Admin',
            emailVerified: true,
        });

        // Set custom claims (optional, for role-based access)
        await auth.setCustomUserClaims(user.uid, { admin: true });

        console.log('✅ Admin account created successfully!');
        console.log('   UID:', user.uid);
        console.log('   Email:', email);
        console.log('   Password:', password);
    } catch (error) {
        console.error('❌ Error creating admin account:', error);
    }

    process.exit(0);
}

seedAdmin();
