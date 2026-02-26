'use client';

import { Package, Star, Sparkles, Crown } from 'lucide-react';

const packages = [
    {
        name: 'Starter',
        price: 350,
        icon: Package,
        color: 'from-green-500 to-emerald-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        items: [
            'Milo (Small)',
            'Nido (Small)',
            'Gari',
            'Sugar',
            'Shito',
            'Biscuits (Assorted)',
            'Toiletries Pack (Soap, Toothpaste, Toothbrush)',
        ],
        description: 'Essential provisions to get students started with the basics.',
    },
    {
        name: 'Ready Box',
        price: 580,
        icon: Star,
        color: 'from-blue-500 to-indigo-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        popular: true,
        items: [
            'Everything in Starter',
            'Milk (Tin)',
            'Drinks (Malt, Juice)',
            'Snacks (Chips, Cookies)',
            'Notebooks (5 pcs)',
            'Extended Toiletries Pack',
        ],
        description: 'A well-rounded box with extras for a comfortable term.',
    },
    {
        name: 'Dadabee',
        price: 780,
        icon: Crown,
        color: 'from-amber-500 to-orange-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        items: [
            'Double Milo/Nido',
            'Cornflakes',
            'Plenty Snacks (10+ packs)',
            'Drinks (6 pack)',
            '15 Notebooks',
            'Huge Soap & Toiletries Pack',
            'Premium Biscuits & Treats',
        ],
        description: 'The ultimate full box — everything a student needs and more.',
    },
];

export default function PackagesPage() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Packages</h1>
                <p className="text-gray-500 mt-1 text-sm">ProviGO provision packages for students</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                    <div
                        key={pkg.name}
                        className={`relative bg-white rounded-2xl border ${pkg.popular ? 'border-blue-200 shadow-lg shadow-blue-50' : 'border-gray-100 shadow-sm'
                            } overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
                    >
                        {pkg.popular && (
                            <div className="absolute top-4 right-4">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                    <Sparkles className="w-3 h-3" /> Popular
                                </span>
                            </div>
                        )}

                        <div className="p-6">
                            <div className={`w-12 h-12 ${pkg.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                                <pkg.icon className="w-6 h-6" style={{ color: pkg.name === 'Starter' ? '#22c55e' : pkg.name === 'Ready Box' ? '#3b82f6' : '#f59e0b' }} />
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-1">{pkg.name}</h3>
                            <p className="text-gray-500 text-sm mb-4">{pkg.description}</p>

                            <div className="mb-6">
                                <span className="text-3xl font-bold text-gray-900">GH₵{pkg.price}</span>
                                <span className="text-gray-400 text-sm"> / package</span>
                            </div>

                            <div className="space-y-3">
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Includes:</p>
                                {pkg.items.map((item, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <div className="w-5 h-5 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-green-600 text-xs">✓</span>
                                        </div>
                                        <span className="text-sm text-gray-600">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
