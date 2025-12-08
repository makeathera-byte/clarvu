'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
    const [env, setEnv] = useState<Record<string, string>>({});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            setEnv({
                hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Yes' : 'No',
                hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Yes' : 'No',
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        }
    }, []);

    return (
        <div className="min-h-screen p-8">
            <h1 className="text-2xl font-bold mb-4">Debug Information</h1>
            <div className="space-y-4">
                <div>
                    <h2 className="font-semibold mb-2">Environment Variables:</h2>
                    <pre className="bg-gray-100 p-4 rounded">
                        {JSON.stringify(env, null, 2)}
                    </pre>
                </div>
                {error && (
                    <div className="bg-red-100 p-4 rounded">
                        <strong>Error:</strong> {error}
                    </div>
                )}
            </div>
        </div>
    );
}

