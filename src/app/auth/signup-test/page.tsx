'use client';

import { useState } from 'react';
import { signUpAction } from '../signup/actions';

export default function SignupTestPage() {
    const [result, setResult] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult('');
        setError('');

        try {
            const formData = {
                email: 'test@example.com',
                password: 'test123456',
                fullName: 'Test User',
                themeName: 'minimal',
                country: 'US',
                timezone: 'UTC',
            };

            console.log('Calling signUpAction with:', formData);
            const result = await signUpAction(formData);
            console.log('Signup result:', result);
            
            setResult(JSON.stringify(result, null, 2));
        } catch (err) {
            console.error('Caught error in component:', err);
            const errorMsg = err instanceof Error 
                ? `${err.message}\n\nStack:\n${err.stack}` 
                : String(err);
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Signup Test Page</h1>
            <p className="mb-4 text-gray-600">
                This page tests the signup action directly to see the actual error.
            </p>
            
            <form onSubmit={handleSubmit} className="mb-6">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                >
                    {loading ? 'Testing...' : 'Test Signup'}
                </button>
            </form>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
                    <h2 className="font-bold text-red-900 mb-2">Error:</h2>
                    <pre className="text-sm text-red-700 whitespace-pre-wrap">{error}</pre>
                </div>
            )}

            {result && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded">
                    <h2 className="font-bold mb-2">Result:</h2>
                    <pre className="text-sm overflow-auto">{result}</pre>
                </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
                <h2 className="font-bold mb-2">Instructions:</h2>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Click "Test Signup" button</li>
                    <li>Check the browser console (F12) for any errors</li>
                    <li>Check the terminal where you run `npm run dev` for server-side errors</li>
                    <li>Copy any error messages you see and share them</li>
                </ol>
            </div>
        </div>
    );
}

