'use client';

import { Shield, Lock, Mail, CreditCard } from 'lucide-react';

export function ReassuranceBlock() {
    const reassurances = [
        { icon: CreditCard, text: 'No credit card required' },
        { icon: Shield, text: 'Cancel anytime' },
        { icon: Lock, text: 'Your data stays private' },
        { icon: Mail, text: 'No spam. Ever.' }
    ];

    return (
        <div className="py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {reassurances.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <div key={index} className="flex flex-col items-center text-center gap-2">
                                <Icon className="w-5 h-5 text-green-600" />
                                <span className="text-sm text-gray-600">{item.text}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
