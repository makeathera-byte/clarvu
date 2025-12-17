"use client";

import { motion } from "framer-motion";
import { BarChart3, Timer, Target, TrendingUp } from "lucide-react";

export function ProductShowcase() {
    const features = [
        {
            icon: BarChart3,
            title: "Your day, visualized",
            description: "See exactly how you spent your time. No guessing, no approximations.",
            gradient: "from-emerald-500 to-teal-600"
        },
        {
            icon: Timer,
            title: "Focus sessions that actually count",
            description: "Track deep work with adaptive sounds. Know when you were truly focused.",
            gradient: "from-teal-500 to-cyan-600"
        },
        {
            icon: TrendingUp,
            title: "See patterns, not just tasks",
            description: "Daily, weekly, and monthly analytics show where your time goes.",
            gradient: "from-green-500 to-emerald-600"
        },
        {
            icon: Target,
            title: "Weekly accountability without pressure",
            description: "Set goals, review progress, improve consistency — without guilt.",
            gradient: "from-cyan-500 to-blue-600"
        }
    ];

    return (
        <section id="product-showcase" className="relative py-16 sm:py-24 overflow-hidden">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-gray-50" />

            {/* Floating Gradient Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                <div className="absolute top-1/4 left-10 w-72 h-72 bg-emerald-300/20 rounded-full blur-3xl" />
                <div className="absolute bottom-1/3 right-10 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-3xl sm:text-5xl font-extrabold mb-4 tracking-tight"
                    >
                        <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                            See what Clarvu actually does
                        </span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-lg text-gray-600 max-w-2xl mx-auto"
                    >
                        Four core features that help you understand your time.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                                className="group relative"
                            >
                                {/* Gradient Glow on Hover */}
                                <div className={`absolute -inset-1 bg-gradient-to-br ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-300`} />

                                {/* Glassmorphic Card */}
                                <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl border-2 border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-300 h-full">
                                    {/* Gradient Border Effect on Hover */}
                                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />

                                    {/* Icon Container */}
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        transition={{ duration: 0.3 }}
                                        className="relative w-14 h-14 mb-5"
                                    >
                                        {/* Icon Background with Gradient */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-xl opacity-10`} />

                                        {/* Glow Effect */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-xl blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-300`} />

                                        {/* Icon */}
                                        <div className={`relative w-full h-full rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center`}>
                                            <Icon className="w-7 h-7 text-white" />
                                        </div>
                                    </motion.div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-3 relative z-10">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed relative z-10">
                                        {feature.description}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
