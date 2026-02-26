import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { sendSMS, buildDeliveryConfirmationSMS } from '@/lib/arkesel';
import { FieldValue } from 'firebase-admin/firestore';

export async function PUT(req: NextRequest) {
    try {
        const { orderId, status } = await req.json();

        if (!orderId || !status) {
            return NextResponse.json({ error: 'Missing orderId or status' }, { status: 400 });
        }

        const validStatuses = ['Processing', 'Confirmed', 'Dispatched', 'Delivered'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        // Find the order by document ID
        const orderRef = adminDb.collection('orders').doc(orderId);
        const orderDoc = await orderRef.get();

        if (!orderDoc.exists) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        await orderRef.update({
            orderStatus: status,
            updatedAt: FieldValue.serverTimestamp(),
        });

        const orderData = orderDoc.data()!;

        // If delivered, send SMS
        if (status === 'Delivered') {
            const smsMessage = buildDeliveryConfirmationSMS({
                orderId: orderData.orderId,
                schoolName: orderData.schoolName,
            });

            const smsResult = await sendSMS({
                to: orderData.phoneNumber,
                message: smsMessage,
            });

            await adminDb.collection('sms_logs').add({
                orderId: orderData.orderId,
                phoneNumber: orderData.phoneNumber,
                message: smsMessage,
                type: 'delivery_confirmation',
                status: smsResult.success ? 'sent' : 'failed',
                createdAt: FieldValue.serverTimestamp(),
            });
        }

        return NextResponse.json({ success: true, status });
    } catch (error) {
        console.error('Update order error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
