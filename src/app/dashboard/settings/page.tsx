'use client';

import { useAuth } from '@/lib/AuthContext';
import { Settings, User, Shield, Bell, Key } from 'lucide-react';

export default function SettingsPage() {
    const { user } = useAuth();

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500 mt-1 text-sm">Manage your account and preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                            <User className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">Admin Profile</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm disabled:opacity-60"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                            <input
                                type="text"
                                value="Super Admin"
                                disabled
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm disabled:opacity-60"
                            />
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                <Shield className="w-5 h-5 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900">Security</h3>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">Account secured with Firebase Authentication</p>
                        <div className="flex items-center gap-2 text-sm text-green-600">
                            <span className="w-2 h-2 bg-green-500 rounded-full" />
                            Protected
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                                <Key className="w-5 h-5 text-purple-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900">API Keys</h3>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Paystack</span>
                                <span className="text-green-600">Connected</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Arkesel SMS</span>
                                <span className="text-green-600">Connected</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Nalo USSD</span>
                                <span className="text-green-600">Connected</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                                <Bell className="w-5 h-5 text-amber-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900">Support</h3>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                            <p>📞 0247112620</p>
                            <p>📧 provigogh@gmail.com</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
