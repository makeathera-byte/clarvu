'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { runCustomAdminQuery } from '@/app/ppadminpp/actions';
import { Terminal, Play, AlertTriangle } from 'lucide-react';

export function AdminQueryRunner() {
    const { currentTheme } = useTheme();
    const [query, setQuery] = useState('SELECT id, full_name, created_at FROM profiles LIMIT 10');
    const [results, setResults] = useState<unknown[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleRun = () => {
        setError(null);
        setResults(null);
        startTransition(async () => {
            const result = await runCustomAdminQuery(query);
            if (result.error) {
                setError(result.error);
            } else if (result.data) {
                setResults(result.data);
            }
        });
    };

    const columns = results && results.length > 0
        ? Object.keys(results[0] as Record<string, unknown>)
        : [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center gap-3">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
                >
                    <Terminal className="w-5 h-5 text-red-500" />
                </div>
                <div>
                    <h3 className="font-semibold" style={{ color: currentTheme.colors.foreground }}>
                        SQL Query Runner
                    </h3>
                    <p className="text-sm" style={{ color: currentTheme.colors.mutedForeground }}>
                        Read-only queries • SELECT statements only
                    </p>
                </div>
            </div>

            {/* Warning */}
            <div
                className="flex items-start gap-3 p-4 rounded-xl"
                style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
            >
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-medium text-amber-500">Safe Mode Enabled</p>
                    <p className="text-xs text-amber-500/70 mt-1">
                        Only SELECT queries are allowed. INSERT, UPDATE, DELETE, and DDL commands are blocked.
                        Requires admin_query RPC function in Supabase.
                    </p>
                </div>
            </div>

            {/* Query Editor */}
            <div
                className="p-4 rounded-2xl border"
                style={{
                    backgroundColor: currentTheme.colors.card,
                    borderColor: currentTheme.colors.border,
                }}
            >
                <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    rows={4}
                    className="w-full bg-transparent resize-none outline-none font-mono text-sm"
                    style={{ color: currentTheme.colors.foreground }}
                    placeholder="SELECT * FROM profiles LIMIT 10;"
                />
                <div className="flex justify-end mt-4">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleRun}
                        disabled={isPending || !query.trim()}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all disabled:opacity-50"
                        style={{
                            backgroundColor: currentTheme.colors.primary,
                            color: '#fff',
                        }}
                    >
                        {isPending ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Play className="w-4 h-4" />
                        )}
                        <span>Run Query</span>
                    </motion.button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                >
                    <p className="text-sm text-red-500 font-mono">{error}</p>
                </div>
            )}

            {/* Results */}
            {results && (
                <div
                    className="p-4 rounded-2xl border overflow-x-auto"
                    style={{
                        backgroundColor: currentTheme.colors.card,
                        borderColor: currentTheme.colors.border,
                    }}
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium" style={{ color: currentTheme.colors.foreground }}>
                            Results
                        </span>
                        <span className="text-xs" style={{ color: currentTheme.colors.mutedForeground }}>
                            {results.length} rows
                        </span>
                    </div>

                    {results.length === 0 ? (
                        <p className="text-sm" style={{ color: currentTheme.colors.mutedForeground }}>
                            No results returned
                        </p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr>
                                    {columns.map(col => (
                                        <th
                                            key={col}
                                            className="text-left py-2 px-3 font-medium border-b"
                                            style={{
                                                color: currentTheme.colors.mutedForeground,
                                                borderColor: currentTheme.colors.border,
                                            }}
                                        >
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {results.slice(0, 50).map((row, i) => (
                                    <tr key={i}>
                                        {columns.map(col => (
                                            <td
                                                key={col}
                                                className="py-2 px-3 border-b font-mono text-xs"
                                                style={{
                                                    color: currentTheme.colors.foreground,
                                                    borderColor: currentTheme.colors.border,
                                                }}
                                            >
                                                {String((row as Record<string, unknown>)[col] ?? '')}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {results.length > 50 && (
                        <p className="text-xs mt-2" style={{ color: currentTheme.colors.mutedForeground }}>
                            Showing first 50 of {results.length} rows
                        </p>
                    )}
                </div>
            )}
        </motion.div>
    );
}
