'use client';

import { useEffect, useState } from 'react';
import { Eye, RefreshCw, ChevronLeft, ChevronRight, Search, CheckCircle2 } from 'lucide-react';

interface Order {
    id: string;
    orderId: string;
    studentName: string;
    schoolName: string;
    houseYear: string;
    package: string;
    price: number;
    phoneNumber: string;
    paymentStatus: string;
    orderStatus: string;
    createdAt: string;
}

export default function PaidOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const perPage = 10;

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/orders');
            const data = await res.json();
            setOrders((data.orders || []).filter((o: Order) => o.paymentStatus === 'paid'));
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    const filteredOrders = orders.filter(
        (o) =>
            o.studentName?.toLowerCase().includes(search.toLowerCase()) ||
            o.orderId?.toLowerCase().includes(search.toLowerCase()) ||
            o.schoolName?.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredOrders.length / perPage);
    const paginatedOrders = filteredOrders.slice((page - 1) * perPage, page * perPage);

    const packageColors: Record<string, string> = {
        Starter: '#22c55e', 'Ready Box': '#3b82f6', Dadabee: '#f59e0b',
    };

    const statusColors: Record<string, string> = {
        Processing: 'bg-blue-50 text-blue-700', Confirmed: 'bg-green-50 text-green-700',
        Dispatched: 'bg-purple-50 text-purple-700', Delivered: 'bg-emerald-50 text-emerald-700',
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Paid Orders</h1>
                        <p className="text-gray-500 text-sm">{orders.length} paid orders</p>
                    </div>
                </div>
                <button onClick={fetchOrders} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium">
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            <div className="relative mb-6 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search paid orders..." value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Order ID</th>
                                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Student</th>
                                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">School</th>
                                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Package</th>
                                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Amount</th>
                                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Status</th>
                                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginatedOrders.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">No paid orders found</td></tr>
                            ) : (
                                paginatedOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.orderId || 'Pending'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{order.studentName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{order.schoolName}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium"
                                                style={{ backgroundColor: `${packageColors[order.package] || '#22c55e'}15`, color: packageColors[order.package] || '#22c55e' }}>
                                                {order.package}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">GH₵ {order.price}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${statusColors[order.orderStatus] || 'bg-gray-50 text-gray-700'}`}>
                                                {order.orderStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">
                                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500">Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, filteredOrders.length)} of {filteredOrders.length}</p>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
                            <span className="text-sm text-gray-600">{page} / {totalPages}</span>
                            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
