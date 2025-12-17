'use client';

import { useState, ReactNode } from 'react';
import { useRealtimeSync } from '@/lib/realtime';

interface RealtimeProviderProps {
    userId: string | null;
    children: ReactNode;
}

export type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';

export function RealtimeProvider({ userId, children }: RealtimeProviderProps) {
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');

    useRealtimeSync({
        userId,
        onConnectionChange: setConnectionStatus,
    });

    return (
        <div data-realtime-status={connectionStatus}>
            {children}
        </div>
    );
}
