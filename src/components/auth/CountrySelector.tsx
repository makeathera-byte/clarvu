'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchCountries } from '@/lib/data/countries';
import { Search, Globe } from 'lucide-react';
import { useTheme } from '@/lib/theme/ThemeContext';

interface CountrySelectorProps {
    selectedCountry: string | null;
    onSelect: (countryCode: string) => void;
}

export function CountrySelector({ selectedCountry, onSelect }: CountrySelectorProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const filteredCountries = searchCountries(searchQuery);
    const { currentTheme } = useTheme();

    return (
        <div className="space-y-6">
            {/* Search Input - Large and Prominent */}
            <div className="relative">
                <Search
                    className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6"
                    style={{ color: currentTheme.colors.mutedForeground }}
                />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for your country..."
                    className="w-full pl-16 pr-6 py-5 border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all text-lg font-medium shadow-lg"
                    style={{
                        borderColor: currentTheme.colors.border,
                        backgroundColor: currentTheme.colors.background,
                        color: currentTheme.colors.foreground,
                    }}
                    autoFocus
                />
            </div>

            {/* Country Grid - Large Cards */}
            <div className="max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {filteredCountries.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {filteredCountries.slice(0, 48).map((country) => {
                                const isSelected = selectedCountry === country.code;
                                return (
                                    <motion.button
                                        key={country.code}
                                        layout
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        whileHover={{ scale: 1.05, y: -4 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => onSelect(country.code)}
                                        className="relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-300 group overflow-hidden"
                                        style={{
                                            borderColor: isSelected ? currentTheme.colors.primary : currentTheme.colors.border,
                                            backgroundColor: isSelected
                                                ? `${currentTheme.colors.primary}15`
                                                : currentTheme.colors.card,
                                            boxShadow: isSelected
                                                ? `0 8px 24px ${currentTheme.colors.primary}40`
                                                : '0 2px 8px rgba(0,0,0,0.05)',
                                        }}
                                    >
                                        {/* Selected indicator */}
                                        {isSelected && (
                                            <motion.div
                                                className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                                                style={{ backgroundColor: currentTheme.colors.primary }}
                                                initial={{ scale: 0, rotate: -180 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                transition={{ type: 'spring', stiffness: 500 }}
                                            >
                                                <motion.div
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ backgroundColor: currentTheme.colors.primaryForeground }}
                                                />
                                            </motion.div>
                                        )}

                                        {/* Flag - Larger */}
                                        <span className="text-5xl group-hover:scale-110 transition-transform duration-200">
                                            {country.flag}
                                        </span>

                                        {/* Country Name */}
                                        <span
                                            className="text-sm font-semibold text-center line-clamp-2 leading-tight"
                                            style={{
                                                color: isSelected
                                                    ? currentTheme.colors.primary
                                                    : currentTheme.colors.foreground,
                                            }}
                                        >
                                            {country.name}
                                        </span>
                                    </motion.button>
                                );
                            })}
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-16 px-6"
                        >
                            <Globe
                                className="w-16 h-16 mb-4 opacity-30"
                                style={{ color: currentTheme.colors.mutedForeground }}
                            />
                            <p
                                className="text-lg font-medium"
                                style={{ color: currentTheme.colors.mutedForeground }}
                            >
                                No countries found
                            </p>
                            <p
                                className="text-sm mt-2"
                                style={{ color: currentTheme.colors.mutedForeground }}
                            >
                                Try a different search term
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Results count */}
            {searchQuery && filteredCountries.length > 0 && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-center font-medium"
                    style={{ color: currentTheme.colors.mutedForeground }}
                >
                    Found {filteredCountries.length} {filteredCountries.length === 1 ? 'country' : 'countries'}
                </motion.p>
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: ${currentTheme.colors.muted};
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: ${currentTheme.colors.primary};
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: ${currentTheme.colors.accent};
                }
            `}</style>
        </div>
    );
}
