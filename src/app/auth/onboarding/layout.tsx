import { ReactNode } from 'react';

export default function OnboardingLayout({ children }: { children: ReactNode }) {
    return (
        <div className="w-full h-screen overflow-hidden">
            {children}
        </div>
    );
}
