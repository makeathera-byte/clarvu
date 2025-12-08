'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to console for debugging
        console.error('Signup page error:', error);
        console.error('Error digest:', error.digest);
        console.error('Error stack:', error.stack);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full p-6 rounded-lg border border-red-200 bg-red-50">
                <h2 className="text-xl font-bold text-red-900 mb-4">Something went wrong!</h2>
                <p className="text-red-700 mb-4">
                    {error.message || 'An unexpected error occurred'}
                </p>
                {error.digest && (
                    <p className="text-sm text-red-600 mb-4">
                        Error ID: {error.digest}
                    </p>
                )}
                <div className="flex gap-4">
                    <Button
                        onClick={reset}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        Try again
                    </Button>
                    <Button
                        asChild
                        variant="outline"
                    >
                        <Link href="/auth/login">Go to Login</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

