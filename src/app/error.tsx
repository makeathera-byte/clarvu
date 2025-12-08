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
        console.error('Global error:', error);
        console.error('Error message:', error.message);
        console.error('Error digest:', error.digest);
        console.error('Error stack:', error.stack);
        console.error('Error name:', error.name);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
            <div className="max-w-md w-full p-8 rounded-lg border border-red-200 bg-white shadow-lg">
                <h2 className="text-2xl font-bold text-red-900 mb-4">Something went wrong!</h2>
                <div className="space-y-4">
                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Error Message:</p>
                        <p className="text-red-700 bg-red-50 p-3 rounded border border-red-200">
                            {error.message || 'An unexpected error occurred'}
                        </p>
                    </div>
                    {error.digest && (
                        <div>
                            <p className="text-sm font-semibold text-gray-700 mb-2">Error ID:</p>
                            <p className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded">
                                {error.digest}
                            </p>
                        </div>
                    )}
                    {error.stack && (
                        <details className="mt-4">
                            <summary className="text-sm font-semibold text-gray-700 cursor-pointer mb-2">
                                Stack Trace (click to expand)
                            </summary>
                            <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded border overflow-auto max-h-60">
                                {error.stack}
                            </pre>
                        </details>
                    )}
                </div>
                <div className="flex gap-4 mt-6">
                    <Button
                        onClick={reset}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        Try again
                    </Button>
                    <Button
                        asChild
                        variant="outline"
                    >
                        <Link href="/">Go to Home</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
