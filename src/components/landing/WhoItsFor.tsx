'use client';

import { CheckCircle2, X } from 'lucide-react';

export function WhoItsFor() {
    const forYou = [
        'You run a business or build seriously',
        'You want clarity, not hype',
        'You care about consistency'
    ];

    const notForYou = [
        'You want motivational quotes',
        'You avoid uncomfortable data',
        'You won\'t reflect honestly'
    ];

    return (
        <section className="py-12 sm:py-16 bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-12 text-center">
                    Is Clarvu right for you?
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* For You */}
                    <div className="bg-white p-8 rounded-lg border-2 border-green-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">
                            Clarvu is for you if:
                        </h3>
                        <div className="space-y-4">
                            {forYou.map((item, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-gray-700">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Not For You */}
                    <div className="bg-white p-8 rounded-lg border-2 border-gray-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">
                            Clarvu is NOT for you if:
                        </h3>
                        <div className="space-y-4">
                            {notForYou.map((item, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-gray-700">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <p className="text-center text-gray-600 mt-8 text-sm">
                    Honest filtering builds trust. We'd rather you know upfront.
                </p>
            </div>
        </section>
    );
}
