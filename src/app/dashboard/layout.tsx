'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
    LayoutDashboard,
    ShoppingCart,
    CheckCircle2,
    Clock,
    Package,
    MessageSquare,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'All Orders', href: '/dashboard/orders', icon: ShoppingCart },
    { label: 'Paid Orders', href: '/dashboard/orders/paid', icon: CheckCircle2 },
    { label: 'Pending Orders', href: '/dashboard/orders/pending', icon: Clock },
    { label: 'Packages', href: '/dashboard/packages', icon: Package },
    { label: 'SMS Logs', href: '/dashboard/sms-logs', icon: MessageSquare },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
                    <p className="text-gray-500 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 flex flex-col transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <Image
                            src="/provigo.png"
                            alt="ProviGO"
                            width={120}
                            height={40}
                            className="object-contain"
                        />
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                                    ? 'bg-green-50 text-green-700 shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon
                                    className={`w-5 h-5 transition-colors ${isActive ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600'
                                        }`}
                                />
                                <span className="flex-1">{item.label}</span>
                                {isActive && <ChevronRight className="w-4 h-4 text-green-400" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* User section */}
                <div className="border-t border-gray-100 p-4">
                    <div className="flex items-center gap-3 px-2 mb-3">
                        <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-700 font-semibold text-sm">
                                {user.email?.[0]?.toUpperCase() || 'A'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                            <p className="text-xs text-gray-400">Super Admin</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden text-gray-600 hover:text-gray-900"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="flex-1 max-w-md mx-4">
                        <input
                            type="text"
                            placeholder="Search orders, students, or schools..."
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer">
                            <span className="text-lg">🔔</span>
                        </div>
                        <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer">
                            <span className="text-lg">❓</span>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}
