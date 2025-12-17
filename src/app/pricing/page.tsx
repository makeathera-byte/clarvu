'use client';

import { CheckIcon, SparklesIcon, ChevronDownIcon, BarChart3, Timer, Target, Lock, Cloud, FileText, Calendar, Zap, Brain, Volume2, FolderKanban, ListChecks } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-white">
            {/* Header Section */}
            <section className="container-padding pt-20 pb-12 md:pt-32 md:pb-16">
                <div className="max-w-4xl mx-auto text-center animate-fade-in">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
                        <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Choose </span>
                        <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">clarity</span>
                        <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent"> that pays for itself.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                        Start free. Upgrade when you're ready to take your time seriously.
                    </p>
                </div>
            </section>

            {/* Pricing Cards Section */}
            <section className="container-padding pb-16 md:pb-24">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                        {/* Monthly Plan */}
                        <div className="relative group bg-white rounded-3xl p-10 md:p-12 flex flex-col border-2 border-gray-100 hover:border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-500 animate-slide-up">
                            {/* Plan Header */}
                            <div className="mb-8">
                                <div className="flex items-baseline justify-between mb-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Monthly</h3>
                                        <p className="text-sm text-gray-500">Flexible month-to-month</p>
                                    </div>
                                </div>

                                {/* Pricing */}
                                <div className="mb-6">
                                    <div className="flex items-baseline gap-2 mb-3">
                                        <span className="text-6xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">$12</span>
                                        <span className="text-xl text-gray-500 font-medium">/ month</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-emerald-600">
                                        <SparklesIcon className="w-4 h-4" />
                                        <span className="text-sm font-semibold">14-day free trial included</span>
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Perfect for getting started and testing if Clarvu works for your workflow.
                                </p>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-8" />

                            {/* Features */}
                            <div className="mb-8 flex-grow">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">What's included</p>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <CheckIcon className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm text-gray-700">All core productivity features</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckIcon className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm text-gray-700">Deep work analytics</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckIcon className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm text-gray-700">Unlimited tasks & categories</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckIcon className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm text-gray-700">Multi-device sync</span>
                                    </li>
                                </ul>
                            </div>

                            {/* CTA */}
                            <div className="space-y-4">
                                <Link
                                    href="/auth/signup"
                                    className="w-full bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-gray-900/20 hover:scale-[1.02] active:scale-100 text-center flex items-center justify-center gap-2 relative overflow-hidden group"
                                >
                                    <span className="relative z-10">Start free trial</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </Link>
                                <p className="text-xs text-gray-500 text-center">
                                    No credit card required • Cancel anytime
                                </p>
                            </div>
                        </div>

                        {/* Yearly Plan - Recommended */}
                        <div className="relative group bg-gradient-to-br from-white to-emerald-50/30 rounded-3xl p-10 md:p-12 flex flex-col border-2 border-emerald-200 hover:border-emerald-300 shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 animate-slide-up [animation-delay:100ms]">
                            {/* Best Value Badge */}
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                                <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-8 py-2.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-2 animate-pulse-glow">
                                    <SparklesIcon className="w-4 h-4" />
                                    <span>Most Popular</span>
                                </div>
                            </div>

                            {/* Plan Header */}
                            <div className="mb-8">
                                <div className="flex items-baseline justify-between mb-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Yearly</h3>
                                        <p className="text-sm text-emerald-700 font-semibold">Save $72 per year</p>
                                    </div>
                                </div>

                                {/* Pricing */}
                                <div className="mb-6">
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className="text-6xl font-extrabold bg-gradient-to-br from-emerald-600 to-teal-700 bg-clip-text text-transparent">$72</span>
                                        <span className="text-xl text-gray-500 font-medium">/ year</span>
                                    </div>
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 mb-3">
                                        <p className="text-sm font-bold text-emerald-700">
                                            Just $6/month when billed annually
                                        </p>
                                        <p className="text-xs text-emerald-600 mt-1">
                                            Pay monthly price: $144/year • You save: <span className="font-bold">$72</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-emerald-600">
                                        <SparklesIcon className="w-4 h-4" />
                                        <span className="text-sm font-semibold">14-day free trial included</span>
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-gray-700 text-sm leading-relaxed">
                                    Best for professionals committed to long-term focus and consistent productivity growth.
                                </p>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent mb-8" />

                            {/* Features */}
                            <div className="mb-8 flex-grow">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Everything in Monthly, plus</p>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <CheckIcon className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm text-gray-700 font-semibold">50% cost savings ($72/year)</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckIcon className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm text-gray-700">Priority email support</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckIcon className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm text-gray-700">One full year of focus insights</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckIcon className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm text-gray-700">Lock in current pricing</span>
                                    </li>
                                </ul>
                            </div>

                            {/* CTA */}
                            <div className="space-y-4">
                                <Link
                                    href="/auth/signup"
                                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-600/40 hover:scale-[1.02] active:scale-100 text-center flex items-center justify-center gap-2 relative overflow-hidden group"
                                >
                                    <span className="relative z-10">Start free trial</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />
                                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                </Link>
                                <p className="text-xs text-gray-600 text-center font-medium">
                                    No credit card required • Cancel anytime
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Categories Section */}
            <section className="container-padding pb-16 md:pb-24">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        Everything you need to master your time
                    </h2>
                    <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
                        All features included in both plans. No hidden costs, no feature tiers.
                    </p>

                    <div className="grid md:grid-cols-2 gap-8">
                        {featureCategories.map((category, catIndex) => (
                            <div
                                key={catIndex}
                                className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/60 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in"
                                style={{ animationDelay: `${catIndex * 100}ms` }}
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center`}>
                                        <category.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">{category.title}</h3>
                                </div>
                                <div className="space-y-4">
                                    {category.features.map((feature, featIndex) => (
                                        <div key={featIndex} className="flex items-start gap-3">
                                            <div className="flex-shrink-0 mt-1">
                                                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                    <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm">{feature.name}</p>
                                                <p className="text-xs text-gray-600 mt-0.5">{feature.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Value Proposition Section */}
            <section className="container-padding pb-16 md:pb-24">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-3xl p-8 md:p-12 border border-emerald-200/50">
                        <h2 className="text-3xl md:text-4xl font-extrabold mb-8 text-center bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                            Why Clarvu pays for itself
                        </h2>
                        <div className="space-y-6">
                            {valuePoints.map((point, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-4 bg-white/60 backdrop-blur-sm p-6 rounded-xl border border-gray-200/50 hover:shadow-md transition-all animate-slide-up"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="flex-shrink-0">
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${point.gradient} flex items-center justify-center`}>
                                            <point.icon className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1 text-gray-900">{point.title}</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">{point.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="container-padding pb-16 md:pb-24">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-center text-gray-600 mb-12">
                        Everything you need to know about Clarvu pricing and features.
                    </p>
                    <FAQAccordion />
                </div>
            </section>

            {/* Risk Reversal Section */}
            <section className="container-padding pb-20 md:pb-32">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/60 shadow-lg">
                        <h3 className="text-2xl font-bold mb-6 text-gray-900">Try Clarvu risk-free</h3>
                        <div className="flex flex-wrap items-center justify-center gap-8 text-gray-600">
                            <div className="flex items-center gap-2">
                                <CheckIcon className="w-5 h-5 text-emerald-600" />
                                <span className="font-medium">14-day free trial</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckIcon className="w-5 h-5 text-emerald-600" />
                                <span className="font-medium">Cancel anytime</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckIcon className="w-5 h-5 text-emerald-600" />
                                <span className="font-medium">Your data stays private</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckIcon className="w-5 h-5 text-emerald-600" />
                                <span className="font-medium">No credit card required</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

// FAQ Accordion Component
function FAQAccordion() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div className="space-y-4">
            {faqs.map((faq, index) => (
                <div
                    key={index}
                    className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/60 overflow-hidden shadow-sm hover:shadow-md transition-all"
                >
                    <button
                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors"
                    >
                        <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                        <ChevronDownIcon
                            className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''
                                }`}
                        />
                    </button>
                    <div
                        className={`overflow-hidden transition-all duration-200 ${openIndex === index ? 'max-h-96' : 'max-h-0'
                            }`}
                    >
                        <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed">
                            {faq.answer}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// Feature Categories Data
const featureCategories = [
    {
        title: 'Analytics & Insights',
        icon: BarChart3,
        gradient: 'from-emerald-500 to-teal-600',
        features: [
            { name: 'Deep work analytics', description: 'Track when you\'re truly focused with intelligent session detection' },
            { name: 'Distraction tracking', description: 'Identify what breaks your flow and when it happens' },
            { name: 'Weekly & monthly reports', description: 'See your progress and patterns over time with beautiful visualizations' },
            { name: 'Category effectiveness', description: 'Understand which work types drain or energize you' },
        ],
    },
    {
        title: 'Productivity Tools',
        icon: Zap,
        gradient: 'from-teal-500 to-cyan-600',
        features: [
            { name: 'Unlimited task tracking', description: 'Create and organize unlimited tasks with business-focused categories' },
            { name: 'Adaptive focus sounds', description: 'AI-powered audio that adapts to your work type and energy levels' },
            { name: 'Goals & accountability', description: 'Set weekly goals and get gentle accountability without pressure' },
            { name: 'Timer & time blocking', description: 'Full-screen timer with customizable work sessions' },
        ],
    },
    {
        title: 'Integrations',
        icon: Cloud,
        gradient: 'from-blue-500 to-indigo-600',
        features: [
            { name: 'Google Calendar sync', description: 'Automatically track time from your calendar events' },
            { name: 'Data export (CSV/PDF)', description: 'Export all your data anytime in standard formats' },
            { name: 'Multi-device sync', description: 'Seamlessly sync across all your devices in real-time' },
        ],
    },
    {
        title: 'Security & Privacy',
        icon: Lock,
        gradient: 'from-purple-500 to-pink-600',
        features: [
            { name: 'Enterprise-grade security', description: 'Your data is encrypted at rest and in transit' },
            { name: 'Private by default', description: 'We never sell your data or show you ads' },
            { name: 'GDPR compliant', description: 'Full data portability and right to deletion' },
        ],
    },
];

// Value Points Data
const valuePoints = [
    {
        icon: Timer,
        gradient: 'from-emerald-500 to-teal-600',
        title: 'Recover 10+ hours per week',
        description: 'Most knowledge workers lose 2-3 hours daily to context switching and distractions. Clarvu helps you reclaim that time through focused work tracking and intelligent insights that show exactly where time goes.',
    },
    {
        icon: Brain,
        gradient: 'from-teal-500 to-cyan-600',
        title: 'Make data-driven decisions',
        description: 'Stop guessing about your productivity. Get clear analytics on when you work best, what drains your energy, and where your time actually goes. Make informed choices about how you invest your most valuable resource.',
    },
    {
        icon: Target,
        gradient: 'from-cyan-500 to-blue-600',
        title: 'Build lasting consistency',
        description: 'Sustainable productivity isn\'t about working harder—it\'s about working smarter. Track your patterns, set realistic goals, and build habits that last without burnout or guilt.',
    },
];

// FAQ Data
const faqs = [
    {
        question: 'What happens after my free trial ends?',
        answer: 'After your 14-day free trial, you\'ll be charged for your chosen plan (monthly or yearly). You can cancel anytime before the trial ends with zero charges. We\'ll send you a reminder email 2 days before your trial expires.',
    },
    {
        question: 'Can I really cancel anytime?',
        answer: 'Absolutely. You can cancel your subscription with one click from your account settings at any time. No phone calls, no hoops to jump through. If you cancel mid-cycle, you\'ll retain access until the end of your billing period.',
    },
    {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards (Visa, Mastercard, American Express) and debit cards through our secure payment processor. We don\'t store your payment information on our servers.',
    },
    {
        question: 'Is my data secure and private?',
        answer: 'Yes. We use enterprise-grade encryption for all data at rest and in transit. We\'re GDPR compliant, never sell your data, and never show you ads. Your productivity data stays completely private to you.',
    },
    {
        question: 'Can I switch between monthly and yearly plans?',
        answer: 'Yes! You can upgrade from monthly to yearly at any time and we\'ll prorate the difference. If you want to switch from yearly to monthly, the change will take effect at your next renewal date.',
    },
    {
        question: 'Do you offer refunds?',
        answer: 'We offer a full refund within the first 30 days if Clarvu isn\'t right for you. Just email support and we\'ll process your refund immediately, no questions asked.',
    },
    {
        question: 'Can I export my data if I leave?',
        answer: 'Of course. You can export all your data in CSV or PDF format at any time from your account settings. Your data is yours, and we believe in full data portability.',
    },
    {
        question: 'What if I need help or have questions?',
        answer: 'We offer email support to all users with typically under 24-hour response times. Paid subscribers also get priority support and access to our growing knowledge base and video tutorials.',
    },
];
