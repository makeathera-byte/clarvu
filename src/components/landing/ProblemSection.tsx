"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";

export function ProblemSection() {
    const problems = [
        "You feel busy but don't move the needle",
        "You lose focus without realizing it",
        "You don't know what actually matters",
        "Most productivity apps add noise, not clarity"
    ];

    return (
        <section className="py-12 sm:py-16 bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-3xl sm:text-4xl font-bold text-gray-900 mb-12 text-center"
                >
                    Why productivity feels broken
                </motion.h2>

                <div className="space-y-4">
                    {problems.map((problem, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            className="flex items-start gap-3 bg-white p-5 rounded-lg border border-gray-200 cursor-default"
                        >
                            <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-gray-700 text-base">{problem}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
