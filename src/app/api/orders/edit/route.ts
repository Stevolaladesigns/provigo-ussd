import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, studentName, schoolName, houseYear, package: pkg, price, phoneNumber, paymentStatus, orderStatus } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });
        }

        const orderRef = adminDb.collection('orders').doc(id);
        const orderDoc = await orderRef.get();

        if (!orderDoc.exists) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        await orderRef.update({
            studentName,
            schoolName,
            houseYear,
            package: pkg,
            price: Number(price),
            phoneNumber,
            paymentStatus,
            orderStatus,
            updatedAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Edit order error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
