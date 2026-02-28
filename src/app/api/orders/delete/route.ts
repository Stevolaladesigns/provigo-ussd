import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });
        }

        const orderRef = adminDb.collection('orders').doc(id);
        await orderRef.delete();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete order error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
