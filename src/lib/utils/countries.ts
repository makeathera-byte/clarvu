// Comprehensive country list with timezones and flag emojis
export interface Country {
    code: string;
    name: string;
    timezone: string;
    flag: string;
}

const _countriesData: Country[] = [
    { code: 'AF', name: 'Afghanistan', timezone: 'Asia/Kabul', flag: '🇦🇫' },
    { code: 'AL', name: 'Albania', timezone: 'Europe/Tirane', flag: '🇦🇱' },
    { code: 'DZ', name: 'Algeria', timezone: 'Africa/Algiers', flag: '🇩🇿' },
    { code: 'AR', name: 'Argentina', timezone: 'America/Argentina/Buenos_Aires', flag: '🇦🇷' },
    { code: 'AU', name: 'Australia', timezone: 'Australia/Sydney', flag: '🇦🇺' },
    { code: 'AT', name: 'Austria', timezone: 'Europe/Vienna', flag: '🇦🇹' },
    { code: 'BD', name: 'Bangladesh', timezone: 'Asia/Dhaka', flag: '🇧🇩' },
    { code: 'BE', name: 'Belgium', timezone: 'Europe/Brussels', flag: '🇧🇪' },
    { code: 'BR', name: 'Brazil', timezone: 'America/Sao_Paulo', flag: '🇧🇷' },
    { code: 'BG', name: 'Bulgaria', timezone: 'Europe/Sofia', flag: '🇧🇬' },
    { code: 'CA', name: 'Canada', timezone: 'America/Toronto', flag: '🇨🇦' },
    { code: 'CL', name: 'Chile', timezone: 'America/Santiago', flag: '🇨🇱' },
    { code: 'CN', name: 'China', timezone: 'Asia/Shanghai', flag: '🇨🇳' },
    { code: 'CO', name: 'Colombia', timezone: 'America/Bogota', flag: '🇨🇴' },
    { code: 'CR', name: 'Costa Rica', timezone: 'America/Costa_Rica', flag: '🇨🇷' },
    { code: 'HR', name: 'Croatia', timezone: 'Europe/Zagreb', flag: '🇭🇷' },
    { code: 'CZ', name: 'Czech Republic', timezone: 'Europe/Prague', flag: '🇨🇿' },
    { code: 'DK', name: 'Denmark', timezone: 'Europe/Copenhagen', flag: '🇩🇰' },
    { code: 'EG', name: 'Egypt', timezone: 'Africa/Cairo', flag: '🇪🇬' },
    { code: 'FI', name: 'Finland', timezone: 'Europe/Helsinki', flag: '🇫🇮' },
    { code: 'FR', name: 'France', timezone: 'Europe/Paris', flag: '🇫🇷' },
    { code: 'DE', name: 'Germany', timezone: 'Europe/Berlin', flag: '🇩🇪' },
    { code: 'GR', name: 'Greece', timezone: 'Europe/Athens', flag: '🇬🇷' },
    { code: 'HK', name: 'Hong Kong', timezone: 'Asia/Hong_Kong', flag: '🇭🇰' },
    { code: 'HU', name: 'Hungary', timezone: 'Europe/Budapest', flag: '🇭🇺' },
    { code: 'IS', name: 'Iceland', timezone: 'Atlantic/Reykjavik', flag: '🇮🇸' },
    { code: 'IN', name: 'India', timezone: 'Asia/Kolkata', flag: '🇮🇳' },
    { code: 'ID', name: 'Indonesia', timezone: 'Asia/Jakarta', flag: '🇮🇩' },
    { code: 'IR', name: 'Iran', timezone: 'Asia/Tehran', flag: '🇮🇷' },
    { code: 'IQ', name: 'Iraq', timezone: 'Asia/Baghdad', flag: '🇮🇶' },
    { code: 'IE', name: 'Ireland', timezone: 'Europe/Dublin', flag: '🇮🇪' },
    { code: 'IL', name: 'Israel', timezone: 'Asia/Jerusalem', flag: '🇮🇱' },
    { code: 'IT', name: 'Italy', timezone: 'Europe/Rome', flag: '🇮🇹' },
    { code: 'JP', name: 'Japan', timezone: 'Asia/Tokyo', flag: '🇯🇵' },
    { code: 'JO', name: 'Jordan', timezone: 'Asia/Amman', flag: '🇯🇴' },
    { code: 'KZ', name: 'Kazakhstan', timezone: 'Asia/Almaty', flag: '🇰🇿' },
    { code: 'KE', name: 'Kenya', timezone: 'Africa/Nairobi', flag: '🇰🇪' },
    { code: 'KW', name: 'Kuwait', timezone: 'Asia/Kuwait', flag: '🇰🇼' },
    { code: 'LV', name: 'Latvia', timezone: 'Europe/Riga', flag: '🇱🇻' },
    { code: 'LB', name: 'Lebanon', timezone: 'Asia/Beirut', flag: '🇱🇧' },
    { code: 'LT', name: 'Lithuania', timezone: 'Europe/Vilnius', flag: '🇱🇹' },
    { code: 'MY', name: 'Malaysia', timezone: 'Asia/Kuala_Lumpur', flag: '🇲🇾' },
    { code: 'MX', name: 'Mexico', timezone: 'America/Mexico_City', flag: '🇲🇽' },
    { code: 'MA', name: 'Morocco', timezone: 'Africa/Casablanca', flag: '🇲🇦' },
    { code: 'NL', name: 'Netherlands', timezone: 'Europe/Amsterdam', flag: '🇳🇱' },
    { code: 'NZ', name: 'New Zealand', timezone: 'Pacific/Auckland', flag: '🇳🇿' },
    { code: 'NG', name: 'Nigeria', timezone: 'Africa/Lagos', flag: '🇳🇬' },
    { code: 'NO', name: 'Norway', timezone: 'Europe/Oslo', flag: '🇳🇴' },
    { code: 'PK', name: 'Pakistan', timezone: 'Asia/Karachi', flag: '🇵🇰' },
    { code: 'PE', name: 'Peru', timezone: 'America/Lima', flag: '🇵🇪' },
    { code: 'PH', name: 'Philippines', timezone: 'Asia/Manila', flag: '🇵🇭' },
    { code: 'PL', name: 'Poland', timezone: 'Europe/Warsaw', flag: '🇵🇱' },
    { code: 'PT', name: 'Portugal', timezone: 'Europe/Lisbon', flag: '🇵🇹' },
    { code: 'QA', name: 'Qatar', timezone: 'Asia/Qatar', flag: '🇶🇦' },
    { code: 'RO', name: 'Romania', timezone: 'Europe/Bucharest', flag: '🇷🇴' },
    { code: 'RU', name: 'Russia', timezone: 'Europe/Moscow', flag: '🇷🇺' },
    { code: 'SA', name: 'Saudi Arabia', timezone: 'Asia/Riyadh', flag: '🇸🇦' },
    { code: 'RS', name: 'Serbia', timezone: 'Europe/Belgrade', flag: '🇷🇸' },
    { code: 'SG', name: 'Singapore', timezone: 'Asia/Singapore', flag: '🇸🇬' },
    { code: 'SK', name: 'Slovakia', timezone: 'Europe/Bratislava', flag: '🇸🇰' },
    { code: 'SI', name: 'Slovenia', timezone: 'Europe/Ljubljana', flag: '🇸🇮' },
    { code: 'ZA', name: 'South Africa', timezone: 'Africa/Johannesburg', flag: '🇿🇦' },
    { code: 'KR', name: 'South Korea', timezone: 'Asia/Seoul', flag: '🇰🇷' },
    { code: 'ES', name: 'Spain', timezone: 'Europe/Madrid', flag: '🇪🇸' },
    { code: 'LK', name: 'Sri Lanka', timezone: 'Asia/Colombo', flag: '🇱🇰' },
    { code: 'SE', name: 'Sweden', timezone: 'Europe/Stockholm', flag: '🇸🇪' },
    { code: 'CH', name: 'Switzerland', timezone: 'Europe/Zurich', flag: '🇨🇭' },
    { code: 'TW', name: 'Taiwan', timezone: 'Asia/Taipei', flag: '🇹🇼' },
    { code: 'TH', name: 'Thailand', timezone: 'Asia/Bangkok', flag: '🇹🇭' },
    { code: 'TR', name: 'Turkey', timezone: 'Europe/Istanbul', flag: '🇹🇷' },
    { code: 'UA', name: 'Ukraine', timezone: 'Europe/Kiev', flag: '🇺🇦' },
    { code: 'AE', name: 'United Arab Emirates', timezone: 'Asia/Dubai', flag: '🇦🇪' },
    { code: 'GB', name: 'United Kingdom', timezone: 'Europe/London', flag: '🇬🇧' },
    { code: 'US', name: 'United States', timezone: 'America/New_York', flag: '🇺🇸' },
    { code: 'UY', name: 'Uruguay', timezone: 'America/Montevideo', flag: '🇺🇾' },
    { code: 'VE', name: 'Venezuela', timezone: 'America/Caracas', flag: '🇻🇪' },
    { code: 'VN', name: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh', flag: '🇻🇳' },
];

// Export sorted countries array
export const countries: Country[] = _countriesData.sort((a, b) => a.name.localeCompare(b.name));

// Try to detect user's timezone automatically
export function detectTimezone(): string {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
        return 'UTC';
    }
}

// Find a country by timezone
export function findCountryByTimezone(timezone: string): Country | undefined {
    return countries.find(c => c.timezone === timezone);
}

// Get default country based on detected timezone
export function getDefaultCountry(): Country {
    try {
        const detectedTz = detectTimezone();
        const match = findCountryByTimezone(detectedTz);
        return match || countries.find(c => c.code === 'US') || countries[0];
    } catch (error) {
        // Fallback to US if there's any error (e.g., during SSR)
        return countries.find(c => c.code === 'US') || countries[0];
    }
}
