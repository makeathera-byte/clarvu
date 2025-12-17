'use client';

import { Sparkles, Calendar, FileDown, Database, TrendingUp } from 'lucide-react';

export function PricingTeaser() {
    const proFeatures = [
        { icon: TrendingUp, text: 'Advanced analytics' },
        { icon: Sparkles, text: 'AI summaries' },
        { icon: Calendar, text: 'Calendar sync' },
        { icon: FileDown, text: 'Exports' },
        { icon: Database, text: 'Long-term history' }
    ];

    return (
        <section className="py-12 sm:py-16 bg-white">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                    Start free. Upgrade when clarity starts paying off.
                </h2>

                <p className="text-lg text-gray-600 mb-12">
                    Try Clarvu free for 14 days. Upgrade to Pro when you're ready for deeper insights.
                </p>

                <div className="bg-gray-50 rounded-lg p-8 border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                        Pro unlocks:
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-xl mx-auto">
                        {proFeatures.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Icon className="w-4 h-4 text-green-600" />
                                    </div>
                                    <span className="text-gray-700">{feature.text}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <p className="text-sm text-gray-500 mt-6">
                    Free plan includes core features. Upgrade anytime.
                </p>
            </div>
        </section>
    );
}
