'use client';

import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Global application error:', error);
    }, [error]);

    return (
        <html lang="en">
            <body>
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <div className="max-w-md w-full text-center space-y-4">
                        <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
                        <p className="text-gray-600">
                            {process.env.NODE_ENV === 'development'
                                ? error.message
                                : 'An unexpected error occurred. Please try again.'}
                        </p>
                        {error.digest && (
                            <p className="text-xs text-gray-500">Error ID: {error.digest}</p>
                        )}
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={reset}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Try again
                            </button>
                            <button
                                onClick={() => (window.location.href = '/')}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                            >
                                Go home
                            </button>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}

