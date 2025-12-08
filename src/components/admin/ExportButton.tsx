'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { exportUsersCSV } from '@/app/ppadminpp/actions';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';

export function ExportButton() {
    const { currentTheme } = useTheme();
    const [isPending, startTransition] = useTransition();
    const [showMenu, setShowMenu] = useState(false);

    const downloadCSV = (csv: string, filename: string) => {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleExportUsers = () => {
        setShowMenu(false);
        startTransition(async () => {
            const result = await exportUsersCSV();
            if (result.csv) {
                downloadCSV(result.csv, `clarvu_users_${new Date().toISOString().split('T')[0]}.csv`);
            } else {
                alert('Export failed: ' + (result.error || 'Unknown error'));
            }
        });
    };

    const handleExportPDF = () => {
        setShowMenu(false);
        // Browser print dialog as simple PDF export
        window.print();
    };

    return (
        <div className="relative">
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowMenu(!showMenu)}
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all"
                style={{
                    backgroundColor: currentTheme.colors.primary,
                    color: '#fff',
                }}
            >
                {isPending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <Download className="w-4 h-4" />
                )}
                <span>Export</span>
            </motion.button>

            {showMenu && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 top-12 z-50 w-48 p-2 rounded-xl border shadow-xl"
                    style={{
                        backgroundColor: currentTheme.colors.card,
                        borderColor: currentTheme.colors.border,
                    }}
                >
                    <button
                        onClick={handleExportUsers}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors"
                        style={{ color: currentTheme.colors.foreground }}
                    >
                        <FileSpreadsheet className="w-4 h-4 text-green-500" />
                        Users CSV
                    </button>
                    <button
                        onClick={handleExportPDF}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors"
                        style={{ color: currentTheme.colors.foreground }}
                    >
                        <FileText className="w-4 h-4 text-red-500" />
                        Print / PDF
                    </button>
                </motion.div>
            )}

            {/* Click outside to close */}
            {showMenu && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                />
            )}
        </div>
    );
}
