import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function GET() {
    try {
        const ordersSnapshot = await adminDb
            .collection('orders')
            .orderBy('createdAt', 'desc')
            .get();

        const orders = ordersSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
                updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
                paidAt: data.paidAt?.toDate?.()?.toISOString() || null,
            };
        });

        return NextResponse.json({ orders });
    } catch (error) {
        console.error('Fetch orders error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
