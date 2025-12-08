'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { type Country } from '@/lib/utils/countries';

interface CountrySelectorProps {
    countries: Country[];
    selectedCountry: Country | null;
    onSelect: (country: Country) => void;
    error?: string;
    currentTheme: {
        colors: {
            foreground: string;
            muted: string;
            mutedForeground: string;
            border: string;
            primary: string;
        };
    };
}

export function CountrySelector({
    countries,
    selectedCountry,
    onSelect,
    error,
    currentTheme,
}: CountrySelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCountries = useMemo(() => {
        if (!searchQuery.trim()) return countries;
        const query = searchQuery.toLowerCase();
        return countries.filter(country =>
            country.name.toLowerCase().includes(query) ||
            country.code.toLowerCase().includes(query)
        );
    }, [countries, searchQuery]);

    return (
        <div className="relative space-y-2">
            {/* Selected Country Display */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-12 px-4 rounded-xl border-2 outline-none transition-all flex items-center justify-between"
                style={{
                    backgroundColor: currentTheme.colors.muted,
                    color: currentTheme.colors.foreground,
                    borderColor: error ? '#ef4444' : (isOpen ? currentTheme.colors.primary : 'transparent'),
                }}
            >
                {selectedCountry ? (
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{selectedCountry.flag}</span>
                        <span>{selectedCountry.name}</span>
                    </div>
                ) : (
                    <span style={{ color: currentTheme.colors.mutedForeground }}>
                        Select your country
                    </span>
                )}
                <svg
                    className="w-5 h-5 transition-transform"
                    style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        color: currentTheme.colors.mutedForeground,
                    }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 w-full mt-2 rounded-xl border shadow-lg overflow-hidden"
                        style={{
                            backgroundColor: currentTheme.colors.muted,
                            borderColor: currentTheme.colors.border,
                        }}
                    >
                        {/* Search Bar */}
                        <div className="p-3 border-b" style={{ borderColor: currentTheme.colors.border }}>
                            <div className="relative">
                                <Search
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                                    style={{ color: currentTheme.colors.mutedForeground }}
                                />
                                <input
                                    type="text"
                                    placeholder="Search countries..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-10 pl-10 pr-10 rounded-lg outline-none transition-all"
                                    style={{
                                        backgroundColor: '#ffffff10',
                                        color: currentTheme.colors.foreground,
                                        border: `1px solid ${currentTheme.colors.border}`,
                                    }}
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                    >
                                        <X className="w-4 h-4" style={{ color: currentTheme.colors.mutedForeground }} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Country List */}
                        <div className="max-h-60 overflow-y-auto">
                            {filteredCountries.length > 0 ? (
                                filteredCountries.map((country) => (
                                    <button
                                        key={country.code}
                                        type="button"
                                        onClick={() => {
                                            onSelect(country);
                                            setIsOpen(false);
                                            setSearchQuery('');
                                        }}
                                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-opacity-50 transition-colors text-left"
                                        style={{
                                            backgroundColor:
                                                selectedCountry?.code === country.code
                                                    ? `${currentTheme.colors.primary}20`
                                                    : 'transparent',
                                            color: currentTheme.colors.foreground,
                                        }}
                                    >
                                        <span className="text-2xl">{country.flag}</span>
                                        <div className="flex-1">
                                            <div>{country.name}</div>
                                            <div
                                                className="text-xs"
                                                style={{ color: currentTheme.colors.mutedForeground }}
                                            >
                                                {country.timezone}
                                            </div>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div
                                    className="px-4 py-8 text-center"
                                    style={{ color: currentTheme.colors.mutedForeground }}
                                >
                                    No countries found
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Timezone Display */}
            {selectedCountry && (
                <p className="text-xs" style={{ color: currentTheme.colors.mutedForeground }}>
                    Timezone: {selectedCountry.timezone}
                </p>
            )}

            {/* Error Message */}
            {error && (
                <p className="text-xs" style={{ color: '#ef4444' }}>
                    {error}
                </p>
            )}
        </div>
    );
}
