'use client';

import { useState } from 'react';
import { signUpAction } from '../auth/signup/actions';

export default function TestSignupPage() {
    const [result, setResult] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const testSignup = async () => {
        setLoading(true);
        setResult('Testing...');
        
        try {
            const testResult = await signUpAction({
                email: 'test@example.com',
                password: 'test123',
                fullName: 'Test User',
                themeName: 'minimal',
                country: 'US',
                timezone: 'UTC',
            });
            
            setResult(JSON.stringify(testResult, null, 2));
        } catch (error) {
            setResult(`Error: ${error instanceof Error ? error.message : String(error)}\nStack: ${error instanceof Error ? error.stack : 'No stack'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-8">
            <h1 className="text-2xl font-bold mb-4">Test Signup Action</h1>
            <button
                onClick={testSignup}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 mb-4"
            >
                {loading ? 'Testing...' : 'Test Signup Action'}
            </button>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
                {result || 'Click the button to test'}
            </pre>
        </div>
    );
}

