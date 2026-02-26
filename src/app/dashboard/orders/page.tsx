'use client';

import { useEffect, useState } from 'react';
import { Eye, RefreshCw, ChevronLeft, ChevronRight, Search } from 'lucide-react';

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

export default function AllOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const perPage = 10;

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/orders');
            const data = await res.json();
            setOrders(data.orders || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const filteredOrders = orders.filter(
        (o) =>
            o.studentName?.toLowerCase().includes(search.toLowerCase()) ||
            o.orderId?.toLowerCase().includes(search.toLowerCase()) ||
            o.schoolName?.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredOrders.length / perPage);
    const paginatedOrders = filteredOrders.slice((page - 1) * perPage, page * perPage);

    const updateOrderStatus = async (orderId: string, status: string) => {
        setUpdatingStatus(true);
        try {
            await fetch('/api/orders/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, status }),
            });
            await fetchOrders();
            setSelectedOrder(null);
        } catch (error) {
            console.error('Error updating order:', error);
        } finally {
            setUpdatingStatus(false);
        }
    };

    const statusColors: Record<string, string> = {
        Processing: 'bg-blue-50 text-blue-700',
        Confirmed: 'bg-green-50 text-green-700',
        Dispatched: 'bg-purple-50 text-purple-700',
        Delivered: 'bg-emerald-50 text-emerald-700',
    };

    const packageColors: Record<string, string> = {
        Starter: '#22c55e',
        'Ready Box': '#3b82f6',
        Dadabee: '#f59e0b',
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
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">All Orders</h1>
                    <p className="text-gray-500 mt-1 text-sm">{orders.length} total orders</p>
                </div>
                <button
                    onClick={fetchOrders}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-6 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by name, order ID, or school..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Order ID</th>
                                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Student Name</th>
                                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">School</th>
                                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Package</th>
                                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Payment</th>
                                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Status</th>
                                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Date</th>
                                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginatedOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-12 text-gray-400 text-sm">
                                        No orders found
                                    </td>
                                </tr>
                            ) : (
                                paginatedOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.orderId || 'Pending'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{order.studentName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{order.schoolName}</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium"
                                                style={{
                                                    backgroundColor: `${packageColors[order.package] || '#22c55e'}15`,
                                                    color: packageColors[order.package] || '#22c55e',
                                                }}
                                            >
                                                {order.package}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-medium ${order.paymentStatus === 'paid'
                                                    ? 'bg-green-50 text-green-700'
                                                    : 'bg-amber-50 text-amber-700'
                                                    }`}
                                            >
                                                <span
                                                    className={`w-1.5 h-1.5 rounded-full ${order.paymentStatus === 'paid' ? 'bg-green-500' : 'bg-amber-500'
                                                        }`}
                                                />
                                                {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${statusColors[order.orderStatus] || 'bg-gray-50 text-gray-700'}`}>
                                                {order.orderStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">
                                            {order.createdAt
                                                ? new Date(order.createdAt).toLocaleDateString('en-GB', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })
                                                : '—'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                title="View / Update"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                            Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, filteredOrders.length)} of{' '}
                            {filteredOrders.length} orders
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm text-gray-600">
                                {page} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="text-gray-400 hover:text-gray-600 text-xl"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">Order ID</p>
                                    <p className="font-medium text-gray-900">{selectedOrder.orderId || 'Pending'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">Package</p>
                                    <p className="font-medium text-gray-900">{selectedOrder.package}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">Student</p>
                                    <p className="font-medium text-gray-900">{selectedOrder.studentName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">School</p>
                                    <p className="font-medium text-gray-900">{selectedOrder.schoolName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">House & Year</p>
                                    <p className="font-medium text-gray-900">{selectedOrder.houseYear}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">Phone</p>
                                    <p className="font-medium text-gray-900">{selectedOrder.phoneNumber}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">Amount</p>
                                    <p className="font-medium text-gray-900">GH₵ {selectedOrder.price}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">Payment</p>
                                    <span
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-medium ${selectedOrder.paymentStatus === 'paid'
                                            ? 'bg-green-50 text-green-700'
                                            : 'bg-amber-50 text-amber-700'
                                            }`}
                                    >
                                        {selectedOrder.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                                    </span>
                                </div>
                            </div>

                            {/* Status Update */}
                            <div className="pt-4 border-t border-gray-100">
                                <p className="text-sm font-medium text-gray-700 mb-3">Update Status</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Processing', 'Confirmed', 'Dispatched', 'Delivered'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => updateOrderStatus(selectedOrder.id, status)}
                                            disabled={updatingStatus || selectedOrder.orderStatus === status}
                                            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${selectedOrder.orderStatus === status
                                                ? 'bg-green-600 text-white shadow-md'
                                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                                } disabled:opacity-50`}
                                        >
                                            {updatingStatus ? '...' : status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
