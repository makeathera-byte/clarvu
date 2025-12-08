'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application error:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="max-w-md w-full text-center space-y-4">
                <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
                <p className="text-muted-foreground">
                    {process.env.NODE_ENV === 'development'
                        ? error.message
                        : 'An unexpected error occurred. Please try again.'}
                </p>
                {error.digest && (
                    <p className="text-xs text-muted-foreground">Error ID: {error.digest}</p>
                )}
                <div className="flex gap-4 justify-center">
                    <Button onClick={reset} variant="default">
                        Try again
                    </Button>
                    <Button onClick={() => (window.location.href = '/')} variant="outline">
                        Go home
                    </Button>
                </div>
            </div>
        </div>
    );
}
