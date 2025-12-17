'use client';

import Link from 'next/link';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

export function LandingFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative bg-gradient-to-b from-black to-gray-950 border-t border-green-500/10">
            <div className="container-padding max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <img
                                src="https://xrdxkgyynnzkbxtxoycl.supabase.co/storage/v1/object/public/logo/Transparent%201_1%20white.png"
                                alt="Clarvu Logo"
                                className="h-8 w-auto"
                            />
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Master your focus, amplify your impact with AI-powered productivity.
                        </p>
                        <div className="flex items-center gap-3">
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 rounded-lg glass border border-white/10 flex items-center justify-center text-gray-400 hover:text-green-400 hover:border-green-500/30 transition-all"
                            >
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 rounded-lg glass border border-white/10 flex items-center justify-center text-gray-400 hover:text-green-400 hover:border-green-500/30 transition-all"
                            >
                                <Github className="w-4 h-4" />
                            </a>
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 rounded-lg glass border border-white/10 flex items-center justify-center text-gray-400 hover:text-green-400 hover:border-green-500/30 transition-all"
                            >
                                <Linkedin className="w-4 h-4" />
                            </a>
                            <a
                                href="mailto:hello@clarvu.com"
                                className="w-9 h-9 rounded-lg glass border border-white/10 flex items-center justify-center text-gray-400 hover:text-green-400 hover:border-green-500/30 transition-all"
                            >
                                <Mail className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Product Column */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Product</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="#features" className="text-gray-400 hover:text-green-400 transition-colors text-sm">
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard" className="text-gray-400 hover:text-green-400 transition-colors text-sm">
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link href="/analytics" className="text-gray-400 hover:text-green-400 transition-colors text-sm">
                                    Analytics
                                </Link>
                            </li>
                            <li>
                                <Link href="/pricing" className="text-gray-400 hover:text-green-400 transition-colors text-sm">
                                    Pricing
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Company Column */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Company</h3>
                        <ul className="space-y-3">
                            <li>
                                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors text-sm">
                                    About Us
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors text-sm">
                                    Blog
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors text-sm">
                                    Careers
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors text-sm">
                                    Contact
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Legal Column */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Legal</h3>
                        <ul className="space-y-3">
                            <li>
                                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors text-sm">
                                    Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors text-sm">
                                    Terms of Service
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors text-sm">
                                    Cookie Policy
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors text-sm">
                                    GDPR
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-green-500/10">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-gray-400 text-sm">
                            © {currentYear} Clarvu. All rights reserved.
                        </p>
                        <p className="text-gray-500 text-xs">
                            Built with ❤️ for productivity enthusiasts
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
