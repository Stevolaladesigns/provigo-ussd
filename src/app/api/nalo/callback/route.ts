import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { sendSMS, buildPaymentConfirmationSMS } from '@/lib/arkesel';
import { FieldValue } from 'firebase-admin/firestore';

async function generateOrderId(): Promise<string> {
    const year = new Date().getFullYear();
    const counterRef = adminDb.collection('counters').doc('orders');

    const result = await adminDb.runTransaction(async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        let count = 1;

        if (counterDoc.exists) {
            count = (counterDoc.data()?.count || 0) + 1;
        }

        transaction.set(counterRef, { count, year }, { merge: true });
        return count;
    });

    return `PVG-${year}-${String(result).padStart(4, '0')}`;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log('Nalo Callback received:', JSON.stringify(body, null, 2));

        const order_id: string = body.order_id;
        const status: string = body.status;
        const amount: string = body.amount;

        // Only process successful payments (status "COMPLETED")
        if (status !== 'COMPLETED' || !order_id) {
            console.log(`Nalo callback ignored. Status: ${status}, Order ID: ${order_id}`);
            return NextResponse.json({ status: 'ignored' });
        }

        // Find the order in Firestore by naloOrderId
        const orderSnap = await adminDb
            .collection('orders')
            .where('naloOrderId', '==', order_id)
            .limit(1)
            .get();

        if (orderSnap.empty) {
            console.error(`Order not found for naloOrderId: ${order_id}`);
            return NextResponse.json({ status: 'not_found' });
        }

        const orderDoc = orderSnap.docs[0];
        const orderRef = orderDoc.ref;
        const orderData = orderDoc.data();

        // Prevent duplicate processing
        if (orderData.paymentStatus === 'paid') {
            console.log(`Order ${order_id} already paid. Ignoring duplicate callback.`);
            return NextResponse.json({ status: 'already_processed' });
        }

        // Generate human-readable Order ID
        const finalOrderId = await generateOrderId();

        // Update order to paid
        await orderRef.update({
            paymentStatus: 'paid',
            orderStatus: 'Confirmed',
            orderId: finalOrderId,
            naloPaymentStatus: status,
            paidAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });

        // Send SMS confirmation to customer
        const smsMessage = buildPaymentConfirmationSMS({
            studentName: orderData.studentName,
            orderId: finalOrderId,
            schoolName: orderData.schoolName,
        });

        const smsResult = await sendSMS({
            to: orderData.phoneNumber,
            message: smsMessage,
        });

        // Log SMS
        await adminDb.collection('sms_logs').add({
            orderId: finalOrderId,
            phoneNumber: orderData.phoneNumber,
            message: smsMessage,
            type: 'payment_confirmation',
            status: smsResult.success ? 'sent' : 'failed',
            createdAt: FieldValue.serverTimestamp(),
        });

        console.log(`Order ${finalOrderId} confirmed via Nalo callback. SMS sent: ${smsResult.success}`);

        return NextResponse.json({ status: 'ok' });
    } catch (error) {
        console.error('Nalo callback error:', error);
        // Always return 200 to Nalo so it does not retry
        return NextResponse.json({ status: 'ok' });
    }
}
