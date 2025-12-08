// Country list with timezone mappings
export interface Country {
    code: string;
    name: string;
    timezone: string;
}

export const countries: Country[] = [
    { code: 'US', name: 'United States', timezone: 'America/New_York' },
    { code: 'GB', name: 'United Kingdom', timezone: 'Europe/London' },
    { code: 'CA', name: 'Canada', timezone: 'America/Toronto' },
    { code: 'AU', name: 'Australia', timezone: 'Australia/Sydney' },
    { code: 'DE', name: 'Germany', timezone: 'Europe/Berlin' },
    { code: 'FR', name: 'France', timezone: 'Europe/Paris' },
    { code: 'IN', name: 'India', timezone: 'Asia/Kolkata' },
    { code: 'JP', name: 'Japan', timezone: 'Asia/Tokyo' },
    { code: 'CN', name: 'China', timezone: 'Asia/Shanghai' },
    { code: 'BR', name: 'Brazil', timezone: 'America/Sao_Paulo' },
    { code: 'MX', name: 'Mexico', timezone: 'America/Mexico_City' },
    { code: 'ES', name: 'Spain', timezone: 'Europe/Madrid' },
    { code: 'IT', name: 'Italy', timezone: 'Europe/Rome' },
    { code: 'NL', name: 'Netherlands', timezone: 'Europe/Amsterdam' },
    { code: 'SE', name: 'Sweden', timezone: 'Europe/Stockholm' },
    { code: 'NO', name: 'Norway', timezone: 'Europe/Oslo' },
    { code: 'DK', name: 'Denmark', timezone: 'Europe/Copenhagen' },
    { code: 'FI', name: 'Finland', timezone: 'Europe/Helsinki' },
    { code: 'PL', name: 'Poland', timezone: 'Europe/Warsaw' },
    { code: 'RU', name: 'Russia', timezone: 'Europe/Moscow' },
    { code: 'KR', name: 'South Korea', timezone: 'Asia/Seoul' },
    { code: 'SG', name: 'Singapore', timezone: 'Asia/Singapore' },
    { code: 'AE', name: 'United Arab Emirates', timezone: 'Asia/Dubai' },
    { code: 'SA', name: 'Saudi Arabia', timezone: 'Asia/Riyadh' },
    { code: 'ZA', name: 'South Africa', timezone: 'Africa/Johannesburg' },
    { code: 'NZ', name: 'New Zealand', timezone: 'Pacific/Auckland' },
    { code: 'IE', name: 'Ireland', timezone: 'Europe/Dublin' },
    { code: 'CH', name: 'Switzerland', timezone: 'Europe/Zurich' },
    { code: 'AT', name: 'Austria', timezone: 'Europe/Vienna' },
    { code: 'BE', name: 'Belgium', timezone: 'Europe/Brussels' },
    { code: 'PT', name: 'Portugal', timezone: 'Europe/Lisbon' },
    { code: 'GR', name: 'Greece', timezone: 'Europe/Athens' },
    { code: 'CZ', name: 'Czech Republic', timezone: 'Europe/Prague' },
    { code: 'HU', name: 'Hungary', timezone: 'Europe/Budapest' },
    { code: 'IL', name: 'Israel', timezone: 'Asia/Jerusalem' },
    { code: 'TH', name: 'Thailand', timezone: 'Asia/Bangkok' },
    { code: 'MY', name: 'Malaysia', timezone: 'Asia/Kuala_Lumpur' },
    { code: 'ID', name: 'Indonesia', timezone: 'Asia/Jakarta' },
    { code: 'PH', name: 'Philippines', timezone: 'Asia/Manila' },
    { code: 'VN', name: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh' },
    { code: 'AR', name: 'Argentina', timezone: 'America/Argentina/Buenos_Aires' },
    { code: 'CL', name: 'Chile', timezone: 'America/Santiago' },
    { code: 'CO', name: 'Colombia', timezone: 'America/Bogota' },
    { code: 'PE', name: 'Peru', timezone: 'America/Lima' },
    { code: 'EG', name: 'Egypt', timezone: 'Africa/Cairo' },
    { code: 'NG', name: 'Nigeria', timezone: 'Africa/Lagos' },
    { code: 'KE', name: 'Kenya', timezone: 'Africa/Nairobi' },
    { code: 'PK', name: 'Pakistan', timezone: 'Asia/Karachi' },
    { code: 'BD', name: 'Bangladesh', timezone: 'Asia/Dhaka' },
    { code: 'TR', name: 'Turkey', timezone: 'Europe/Istanbul' },
    { code: 'UA', name: 'Ukraine', timezone: 'Europe/Kiev' },
    { code: 'RO', name: 'Romania', timezone: 'Europe/Bucharest' },
].sort((a, b) => a.name.localeCompare(b.name));

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
    const detectedTz = detectTimezone();
    const match = findCountryByTimezone(detectedTz);
    return match || countries.find(c => c.code === 'US') || countries[0];
}
