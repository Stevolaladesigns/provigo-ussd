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
        const orderDoc = await adminDb.collection('orders').doc(orderId).get();

        if (!orderDoc.exists) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404, headers: corsHeaders }
            );
        }

        const data = orderDoc.data()!;

        // Return relevant tracking data (exclude sensitive info if needed)
        const trackingData = {
            id: orderDoc.id,
            status: data.status,
            packageDetails: data.packageDetails,
            amount: data.amount,
            deliveryAddress: data.deliveryAddress,
            orderDate: data.createdAt?.toDate?.()?.toISOString() || null,
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
        };

        return NextResponse.json({ order: trackingData }, { status: 200, headers: corsHeaders });
    } catch (error) {
        console.error('Tracking API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
    }
}
