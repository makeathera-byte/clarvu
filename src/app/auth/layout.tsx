'use client';

import { ReactNode } from 'react';
import { BackgroundRenderer } from '@/components/theme/BackgroundRenderer';

interface AuthLayoutProps {
    children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Theme-aware wallpaper background */}
            <BackgroundRenderer />

            {/* Centered content container */}
            <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
                {children}
            </div>
        </div>
    );
}
