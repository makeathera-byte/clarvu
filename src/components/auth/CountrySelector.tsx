'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchCountries, type Country } from '@/lib/data/countries';
import { FiSearch, FiCheck } from 'react-icons/fi';

interface CountrySelectorProps {
    selectedCountry: string | null;
    onSelect: (countryCode: string) => void;
}

export function CountrySelector({ selectedCountry, onSelect }: CountrySelectorProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const filteredCountries = searchCountries(searchQuery);

    return (
        <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search countries..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none text-sm"
                />
            </div>

            {/* Country List */}
            <div className="max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-white">
                <AnimatePresence mode="popLayout">
                    {filteredCountries.length > 0 ? (
                        filteredCountries.map((country) => (
                            <motion.button
                                key={country.code}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => onSelect(country.code)}
                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-0 ${selectedCountry === country.code ? 'bg-purple-100' : ''
                                    }`}
                            >
                                <span className="text-2xl">{country.flag}</span>
                                <span className="flex-1 text-left text-sm font-medium text-gray-900">
                                    {country.name}
                                </span>
                                {selectedCountry === country.code && (
                                    <FiCheck className="w-5 h-5 text-purple-600" />
                                )}
                            </motion.button>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-500 text-sm">
                            No countries found
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {filteredCountries.length > 10 && (
                <p className="text-xs text-gray-500 text-center">
                    Showing {filteredCountries.length} countries
                </p>
            )}
        </div>
    );
}
