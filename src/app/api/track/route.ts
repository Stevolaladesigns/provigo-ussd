import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

// Set CORS headers to allow requests from the other website
const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // Allows all origins, but can be restricted to specific domain
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');

    if (!orderId) {
        return NextResponse.json(
            { error: 'Order ID is required parameter' },
            { status: 400, headers: corsHeaders }
        );
    }

    try {
        // Search by Document ID or by the human-readable orderId field
        let orderDoc = await adminDb.collection('orders').doc(orderId).get();
        let data = orderDoc.exists ? orderDoc.data() : null;

        if (!data) {
            const querySnap = await adminDb
                .collection('orders')
                .where('orderId', '==', orderId.toUpperCase())
                .limit(1)
                .get();

            if (!querySnap.empty) {
                orderDoc = querySnap.docs[0];
                data = orderDoc.data();
            }
        }

        if (!data) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404, headers: corsHeaders }
            );
        }

        // Return relevant tracking data matching the database schema
        const trackingData = {
            id: orderDoc.id,
            orderId: data.orderId,
            status: data.orderStatus || 'Processing',
            packageDetails: data.package || 'Custom',
            amount: data.price || 0,
            deliveryAddress: `${data.schoolName || ''}, ${data.houseYear || ''}`.trim().replace(/^, |, $/g, ''),
            orderDate: data.createdAt?.toDate?.()?.toISOString() || null,
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
        };

        return NextResponse.json({ order: trackingData }, { status: 200, headers: corsHeaders });
    } catch (error) {
        console.error('Tracking API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
    }
}
