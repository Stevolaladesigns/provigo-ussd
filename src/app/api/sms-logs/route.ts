import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function GET() {
    try {
        const smsSnapshot = await adminDb
            .collection('sms_logs')
            .orderBy('createdAt', 'desc')
            .limit(100)
            .get();

        const logs = smsSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
            };
        });

        return NextResponse.json({ logs });
    } catch (error) {
        console.error('Fetch SMS logs error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
