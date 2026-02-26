import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyPaystackSignature } from '@/lib/paystack';
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
        const body = await req.text();
        const signature = req.headers.get('x-paystack-signature') || '';

        // Verify Paystack signature
        if (!verifyPaystackSignature(body, signature)) {
            console.error('Invalid Paystack webhook signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        const event = JSON.parse(body);

        if (event.event === 'charge.success') {
            const data = event.data;
            const metadata = data.metadata || {};
            const firestoreDocId = metadata.orderId;

            if (!firestoreDocId) {
                console.error('No orderId in webhook metadata');
                return NextResponse.json({ status: 'ok' });
            }

            // Find the order
            const orderRef = adminDb.collection('orders').doc(firestoreDocId);
            const orderDoc = await orderRef.get();

            if (!orderDoc.exists) {
                console.error('Order not found:', firestoreDocId);
                return NextResponse.json({ status: 'ok' });
            }

            // Generate formatted Order ID
            const orderId = await generateOrderId();

            // Update order
            await orderRef.update({
                paymentStatus: 'paid',
                orderStatus: 'Confirmed',
                orderId: orderId,
                paystackReference: data.reference,
                paidAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
            });

            const orderData = orderDoc.data()!;

            // Send SMS confirmation
            const smsMessage = buildPaymentConfirmationSMS({
                studentName: orderData.studentName,
                orderId: orderId,
                schoolName: orderData.schoolName,
            });

            const smsResult = await sendSMS({
                to: orderData.phoneNumber,
                message: smsMessage,
            });

            // Log SMS
            await adminDb.collection('sms_logs').add({
                orderId: orderId,
                phoneNumber: orderData.phoneNumber,
                message: smsMessage,
                type: 'payment_confirmation',
                status: smsResult.success ? 'sent' : 'failed',
                createdAt: FieldValue.serverTimestamp(),
            });

            console.log(`Order ${orderId} confirmed. SMS sent:`, smsResult.success);
        }

        return NextResponse.json({ status: 'ok' });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ status: 'ok' });
    }
}
