'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

interface SMSLog {
    id: string;
    orderId: string;
    phoneNumber: string;
    message: string;
    type: string;
    status: string;
    createdAt: string;
}

export default function SMSLogsPage() {
    const [logs, setLogs] = useState<SMSLog[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/sms-logs');
            const data = await res.json();
            setLogs(data.logs || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLogs(); }, []);

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
                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">SMS Logs</h1>
                        <p className="text-gray-500 text-sm">{logs.length} messages sent</p>
                    </div>
                </div>
                <button onClick={fetchLogs} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium">
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Order ID</th>
                                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Phone</th>
                                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Type</th>
                                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Message</th>
                                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Status</th>
                                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {logs.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">No SMS logs yet</td></tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{log.orderId}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{log.phoneNumber}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${log.type === 'payment_confirmation' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                                                }`}>
                                                {log.type === 'payment_confirmation' ? 'Payment' : 'Delivery'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{log.message}</td>
                                        <td className="px-6 py-4">
                                            {log.status === 'sent' ? (
                                                <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                                                    <CheckCircle2 className="w-4 h-4" /> Sent
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-red-500 text-sm">
                                                    <XCircle className="w-4 h-4" /> Failed
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">
                                            {log.createdAt ? new Date(log.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
