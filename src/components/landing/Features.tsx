"use client";

import { motion } from "framer-motion";
import { Brain, Volume2, FolderKanban, ListChecks, Lock } from "lucide-react";

export function Features() {
    const features = [
        {
            icon: Brain,
            title: "Deep Work Analytics",
            outcome: "Know when you're truly focused",
            gradient: "from-emerald-500 to-teal-600"
        },
        {
            icon: Volume2,
            title: "Adaptive Focus Sounds",
            outcome: "Stay in flow longer",
            gradient: "from-teal-500 to-cyan-600"
        },
        {
            icon: FolderKanban,
            title: "Business-focused Categories",
            outcome: "See what grows your business",
            gradient: "from-green-500 to-emerald-600"
        },
        {
            icon: ListChecks,
            title: "Goals & Reviews",
            outcome: "Weekly accountability without pressure",
            gradient: "from-cyan-500 to-blue-600"
        },
        {
            icon: Brain,
            title: "AI Insights",
            outcome: "Understand your patterns automatically",
            gradient: "from-emerald-600 to-green-700"
        },
        {
            icon: Lock,
            title: "Private & Secure",
            outcome: "Your data stays yours",
            gradient: "from-teal-600 to-cyan-700"
        }
    ];

    return (
        <section className="relative py-16 sm:py-24 overflow-hidden">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/50 to-white" />

            {/* Subtle Gradient Mesh */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-3xl sm:text-5xl font-extrabold mb-4"
                    >
                        <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                            Built for clarity, not complexity
                        </span>
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.08 }}
                                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                                className="group relative text-center cursor-default"
                            >
                                {/* Glassmorphic Card */}
                                <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                                    {/* Gradient Glow on Hover */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />

                                    {/* Icon Container with Gradient */}
                                    <motion.div
                                        whileHover={{ scale: 1.15, rotate: 10 }}
                                        transition={{ duration: 0.3 }}
                                        className="relative w-14 h-14 mx-auto mb-5"
                                    >
                                        {/* Gradient Background */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-xl opacity-10 group-hover:opacity-20 transition-opacity`} />

                                        {/* Glow Effect */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity`} />

                                        {/* Icon */}
                                        <div className={`relative w-full h-full rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center`}>
                                            <Icon className="w-7 h-7 text-white" />
                                        </div>
                                    </motion.div>

                                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {feature.outcome}
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
