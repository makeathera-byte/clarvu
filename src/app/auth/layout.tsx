import { ReactNode } from 'react';
import { Logo } from '@/components/layout/Logo';

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen flex items-center justify-center auth-page-bg">
            <div className="w-full max-w-md px-4 py-8">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Logo />
                </div>

                {/* Auth Card */}
                <div className="auth-card">
                    {children}
                </div>
            </div>
        </div>
    );
}
