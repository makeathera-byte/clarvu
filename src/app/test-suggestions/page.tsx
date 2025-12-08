'use client';

import { useEffect, useState } from 'react';
import { getSuggestionsForUser } from '@/app/tasks/suggestionsActions';

export default function TestSuggestionsPage() {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSuggestions = async () => {
        if (!query) return;
        setLoading(true);
        setError(null);
        try {
            const result = await getSuggestionsForUser(query);
            console.log('Test page result:', result);
            setSuggestions(result.suggestions || []);
            if (result.error) {
                setError(result.error);
            }
        } catch (err) {
            console.error('Test page error:', err);
            setError(String(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Test Suggestions API</h1>

            <div className="mb-4">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Type to search (e.g., 'gym')"
                    className="border p-2 rounded w-64"
                />
                <button
                    onClick={fetchSuggestions}
                    className="ml-2 bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Search
                </button>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}

            <div className="mt-4">
                <h2 className="font-bold mb-2">Results ({suggestions.length}):</h2>
                <ul className="list-disc pl-5">
                    {suggestions.map((s) => (
                        <li key={s.id}>
                            {s.text} {s.is_global && '(Global)'} - Frequency: {s.frequency}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mt-8 p-4 bg-gray-100 rounded">
                <h3 className="font-bold mb-2">Debug Info:</h3>
                <p>Query: {query}</p>
                <p>Suggestions count: {suggestions.length}</p>
                <p>Check browser console for detailed logs</p>
            </div>
        </div>
    );
}
