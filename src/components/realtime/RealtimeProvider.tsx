'use client';

import { useState, ReactNode } from 'react';
import { useRealtimeSync } from '@/lib/realtime';
import { OAuthOnboardingModal } from '@/components/auth/OAuthOnboardingModal';

interface RealtimeProviderProps {
    userId: string;
    children: ReactNode;
    needsOnboarding?: boolean;
}

export type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';

export function RealtimeProvider({ userId, children, needsOnboarding = false }: RealtimeProviderProps) {
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');

    useRealtimeSync({
        userId,
        onConnectionChange: setConnectionStatus,
    });

    return (
        <div data-realtime-status={connectionStatus}>
            {needsOnboarding && <OAuthOnboardingModal />}
            {children}
        </div>
    );
}
