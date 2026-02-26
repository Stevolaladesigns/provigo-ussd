import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function GET() {
    try {
        const ordersSnapshot = await adminDb.collection('orders').get();

        let totalOrders = 0;
        let paidOrders = 0;
        let pendingOrders = 0;
        let totalRevenue = 0;
        const packageCounts: Record<string, number> = { Starter: 0, 'Ready Box': 0, Dadabee: 0 };
        const ordersByDate: Record<string, number> = {};

        ordersSnapshot.docs.forEach((doc) => {
            const data = doc.data();
            totalOrders++;

            if (data.paymentStatus === 'paid') {
                paidOrders++;
                totalRevenue += data.price || 0;
            } else {
                pendingOrders++;
            }

            if (data.package && packageCounts[data.package] !== undefined) {
                packageCounts[data.package]++;
            }

            const date = data.createdAt?.toDate?.();
            if (date) {
                const dateStr = date.toISOString().split('T')[0];
                ordersByDate[dateStr] = (ordersByDate[dateStr] || 0) + 1;
            }
        });

        // Convert ordersByDate to sorted array
        const ordersTrend = Object.entries(ordersByDate)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-30)
            .map(([date, count]) => ({ date, count }));

        const packageData = Object.entries(packageCounts).map(([name, count]) => ({
            name,
            count,
        }));

        return NextResponse.json({
            totalOrders,
            paidOrders,
            pendingOrders,
            totalRevenue,
            packageData,
            ordersTrend,
        });
    } catch (error) {
        console.error('Stats error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
