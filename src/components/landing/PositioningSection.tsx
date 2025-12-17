"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export function PositioningSection() {
    const points = [
        "Tracks what you actually do, not what you plan",
        "Separates deep work from distraction",
        "Shows daily, weekly, and monthly patterns",
        "Encourages honest reflection, not guilt"
    ];

    return (
        <section className="py-12 sm:py-16 bg-white">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 text-center"
                >
                    Clarvu doesn&apos;t motivate you.
                    <br />
                    It shows you the truth.
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-lg text-gray-600 mb-12 text-center max-w-2xl mx-auto"
                >
                    No gamification. No badges. Just clear data about where your time goes.
                </motion.p>

                <div className="space-y-4">
                    {points.map((point, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            className="flex items-start gap-3 p-5 rounded-lg border border-gray-200 bg-gray-50 cursor-default"
                        >
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <p className="text-gray-700 text-base font-medium">{point}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
