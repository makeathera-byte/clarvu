"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const microLines = [
    "Clarity beats motivation.",
    "Busy doesn't mean productive.",
    "Recover hours you didn't know you were losing.",
    "Focus, measured honestly."
];

export function Hero() {
    const [currentMicroLine, setCurrentMicroLine] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMicroLine((prev) => (prev + 1) % microLines.length);
        }, 3500);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 sm:pt-24 pb-16 overflow-hidden bg-white">
            {/* Light Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-emerald-50/30 to-white">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-100/40 via-transparent to-transparent animate-pulse-slow" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-teal-100/40 via-transparent to-transparent animate-pulse-slow" style={{ animationDelay: '1s' }} />
            </div>

            {/* Floating Gradient Orbs - Light Version */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-20 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl animate-float" />
                <div className="absolute top-1/3 -right-20 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
                <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-green-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
            </div>

            {/* Grid Pattern - Light */}
            <div className="absolute inset-0 opacity-[0.02]">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98120_1px,transparent_1px),linear-gradient(to_bottom,#10b98120_1px,transparent_1px)] bg-[size:4rem_4rem]" />
            </div>

            <div className="relative z-10">
                {/* Text Content Container */}
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    {/* Main Headline with Gradient Text */}
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 tracking-tight">
                        <span className="block text-gray-900">Built for people who</span>
                        <span className="block bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                            actually run things.
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed font-light">
                        Clarvu helps business owners track focus, cut wasted time, and improve consistently — without micromanaging their day.
                    </p>

                    {/* Rotating Micro-lines with Enhanced Animation */}
                    <div className="h-8 mb-10">
                        <p
                            key={currentMicroLine}
                            className="text-base sm:text-lg bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent font-semibold animate-fade-in"
                        >
                            {microLines[currentMicroLine]}
                        </p>
                    </div>

                    {/* Premium CTA Button */}
                    <div className="mb-6">
                        <Link
                            href="/pricing"
                            className="group relative inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-600/40 overflow-hidden"
                        >
                            {/* Animated Glow Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />

                            {/* Button Content */}
                            <span className="relative z-10">Get Started</span>
                            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />

                            {/* Shimmer Effect */}
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        </Link>
                    </div>

                    {/* Trust text */}
                    <p className="text-sm text-gray-500 mb-16">
                        No credit card required • Cancel anytime
                    </p>
                </div>

                {/* Product Visual - Premium Glassmorphic Container */}
                <div className="mt-20 w-full">
                    <div className="relative w-full max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-12">
                        {/* Enhanced Glow */}
                        <div className="absolute -inset-8 bg-gradient-to-r from-emerald-200/30 via-teal-200/30 to-cyan-200/30 blur-3xl rounded-full opacity-60" />

                        {/* Glassmorphic Container with Float Animation */}
                        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/60 shadow-2xl hover:shadow-emerald-200/40 transition-all duration-500 group animate-float-slow">
                            {/* Inner Glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/30 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Screenshot */}
                            <div className="relative rounded-2xl overflow-hidden border border-gray-200/40 shadow-xl">
                                <img
                                    src="https://xrdxkgyynnzkbxtxoycl.supabase.co/storage/v1/object/public/Landing%20page/Screenshot%202025-12-16%20040937.png"
                                    alt="Clarvu Dashboard showing daily timeline and analytics"
                                    className="rounded-2xl w-full h-auto transition-transform duration-700 group-hover:scale-[1.02]"
                                    loading="eager"
                                    fetchPriority="high"
                                />
                            </div>
                        </div>
                    </div>
                    <p className="text-gray-500 text-base mt-8 font-light text-center">
                        Your day — visualized clearly.
                    </p>
                </div>
            </div>

            {/* Custom Animation Styles */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) translateX(0px); }
                    33% { transform: translateY(-20px) translateX(10px); }
                    66% { transform: translateY(10px) translateX(-10px); }
                }
                
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }

                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.5; }
                }

                .animate-float {
                    animation: float 20s ease-in-out infinite;
                }

                .animate-float-slow {
                    animation: float-slow 6s ease-in-out infinite;
                }

                .animate-pulse-slow {
                    animation: pulse-slow 8s ease-in-out infinite;
                }
            `}</style>
        </section>
    );
}
