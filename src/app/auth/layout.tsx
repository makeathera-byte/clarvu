import { ReactNode } from 'react';
import Image from 'next/image';

import type { Metadata } from 'next';

export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
    },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen flex items-center justify-center auth-page-bg">
            <div className="w-full max-w-md px-4 py-8">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Image
                        src="https://xrdxkgyynnzkbxtxoycl.supabase.co/storage/v1/object/public/logo/Transparent%20logo%201_1.png"
                        alt="Clarvu Logo"
                        width={140}
                        height={40}
                        priority
                    />
                </div>

                {/* Auth Card */}
                <div className="auth-card">
                    {children}
                </div>
            </div>
        </div>
    );
}
