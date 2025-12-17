'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ReassuranceBlock } from './ReassuranceBlock';

export function CTA() {
    return (
        <section className="py-12 sm:py-16 bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                    Stop guessing.
                    <br />
                    Start seeing.
                </h2>

                <p className="text-lg text-gray-600 mb-10 max-w-xl mx-auto">
                    Join business owners who chose clarity over chaos.
                </p>

                <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 px-10 py-5 bg-green-600 text-white rounded-lg font-bold text-lg shadow-lg hover:bg-green-700 transition-colors duration-200"
                >
                    Get Started
                    <ArrowRight className="w-6 h-6" />
                </Link>

                <ReassuranceBlock />
            </div>
        </section>
    );
}
