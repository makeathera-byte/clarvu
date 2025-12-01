/**
 * Utility functions for country data
 */

/**
 * Convert ISO country code to flag emoji
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., "US", "GB")
 * @returns Flag emoji string
 */
export function getCountryFlag(countryCode: string): string {
  if (!countryCode || countryCode === "unknown" || countryCode.length !== 2) {
    return "🌍"; // Default globe emoji for unknown
  }
  
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch (error) {
    return "🌍"; // Fallback to globe emoji
  }
}

/**
 * Comprehensive list of countries with timezones
 * Sorted alphabetically by country name
 */
export interface Country {
  code: string;
  name: string;
  timezone: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  { code: "AF", name: "Afghanistan", timezone: "Asia/Kabul", flag: getCountryFlag("AF") },
  { code: "AL", name: "Albania", timezone: "Europe/Tirane", flag: getCountryFlag("AL") },
  { code: "DZ", name: "Algeria", timezone: "Africa/Algiers", flag: getCountryFlag("DZ") },
  { code: "AR", name: "Argentina", timezone: "America/Argentina/Buenos_Aires", flag: getCountryFlag("AR") },
  { code: "AM", name: "Armenia", timezone: "Asia/Yerevan", flag: getCountryFlag("AM") },
  { code: "AU", name: "Australia", timezone: "Australia/Sydney", flag: getCountryFlag("AU") },
  { code: "AT", name: "Austria", timezone: "Europe/Vienna", flag: getCountryFlag("AT") },
  { code: "AZ", name: "Azerbaijan", timezone: "Asia/Baku", flag: getCountryFlag("AZ") },
  { code: "BH", name: "Bahrain", timezone: "Asia/Bahrain", flag: getCountryFlag("BH") },
  { code: "BD", name: "Bangladesh", timezone: "Asia/Dhaka", flag: getCountryFlag("BD") },
  { code: "BY", name: "Belarus", timezone: "Europe/Minsk", flag: getCountryFlag("BY") },
  { code: "BE", name: "Belgium", timezone: "Europe/Brussels", flag: getCountryFlag("BE") },
  { code: "BO", name: "Bolivia", timezone: "America/La_Paz", flag: getCountryFlag("BO") },
  { code: "BA", name: "Bosnia and Herzegovina", timezone: "Europe/Sarajevo", flag: getCountryFlag("BA") },
  { code: "BR", name: "Brazil", timezone: "America/Sao_Paulo", flag: getCountryFlag("BR") },
  { code: "BG", name: "Bulgaria", timezone: "Europe/Sofia", flag: getCountryFlag("BG") },
  { code: "KH", name: "Cambodia", timezone: "Asia/Phnom_Penh", flag: getCountryFlag("KH") },
  { code: "CA", name: "Canada", timezone: "America/Toronto", flag: getCountryFlag("CA") },
  { code: "CL", name: "Chile", timezone: "America/Santiago", flag: getCountryFlag("CL") },
  { code: "CN", name: "China", timezone: "Asia/Shanghai", flag: getCountryFlag("CN") },
  { code: "CO", name: "Colombia", timezone: "America/Bogota", flag: getCountryFlag("CO") },
  { code: "CR", name: "Costa Rica", timezone: "America/Costa_Rica", flag: getCountryFlag("CR") },
  { code: "HR", name: "Croatia", timezone: "Europe/Zagreb", flag: getCountryFlag("HR") },
  { code: "CU", name: "Cuba", timezone: "America/Havana", flag: getCountryFlag("CU") },
  { code: "CZ", name: "Czech Republic", timezone: "Europe/Prague", flag: getCountryFlag("CZ") },
  { code: "DK", name: "Denmark", timezone: "Europe/Copenhagen", flag: getCountryFlag("DK") },
  { code: "DO", name: "Dominican Republic", timezone: "America/Santo_Domingo", flag: getCountryFlag("DO") },
  { code: "EC", name: "Ecuador", timezone: "America/Guayaquil", flag: getCountryFlag("EC") },
  { code: "EG", name: "Egypt", timezone: "Africa/Cairo", flag: getCountryFlag("EG") },
  { code: "EE", name: "Estonia", timezone: "Europe/Tallinn", flag: getCountryFlag("EE") },
  { code: "ET", name: "Ethiopia", timezone: "Africa/Addis_Ababa", flag: getCountryFlag("ET") },
  { code: "FI", name: "Finland", timezone: "Europe/Helsinki", flag: getCountryFlag("FI") },
  { code: "FR", name: "France", timezone: "Europe/Paris", flag: getCountryFlag("FR") },
  { code: "GE", name: "Georgia", timezone: "Asia/Tbilisi", flag: getCountryFlag("GE") },
  { code: "DE", name: "Germany", timezone: "Europe/Berlin", flag: getCountryFlag("DE") },
  { code: "GH", name: "Ghana", timezone: "Africa/Accra", flag: getCountryFlag("GH") },
  { code: "GR", name: "Greece", timezone: "Europe/Athens", flag: getCountryFlag("GR") },
  { code: "GT", name: "Guatemala", timezone: "America/Guatemala", flag: getCountryFlag("GT") },
  { code: "HN", name: "Honduras", timezone: "America/Tegucigalpa", flag: getCountryFlag("HN") },
  { code: "HK", name: "Hong Kong", timezone: "Asia/Hong_Kong", flag: getCountryFlag("HK") },
  { code: "HU", name: "Hungary", timezone: "Europe/Budapest", flag: getCountryFlag("HU") },
  { code: "IS", name: "Iceland", timezone: "Atlantic/Reykjavik", flag: getCountryFlag("IS") },
  { code: "IN", name: "India", timezone: "Asia/Kolkata", flag: getCountryFlag("IN") },
  { code: "ID", name: "Indonesia", timezone: "Asia/Jakarta", flag: getCountryFlag("ID") },
  { code: "IR", name: "Iran", timezone: "Asia/Tehran", flag: getCountryFlag("IR") },
  { code: "IQ", name: "Iraq", timezone: "Asia/Baghdad", flag: getCountryFlag("IQ") },
  { code: "IE", name: "Ireland", timezone: "Europe/Dublin", flag: getCountryFlag("IE") },
  { code: "IL", name: "Israel", timezone: "Asia/Jerusalem", flag: getCountryFlag("IL") },
  { code: "IT", name: "Italy", timezone: "Europe/Rome", flag: getCountryFlag("IT") },
  { code: "JM", name: "Jamaica", timezone: "America/Jamaica", flag: getCountryFlag("JM") },
  { code: "JP", name: "Japan", timezone: "Asia/Tokyo", flag: getCountryFlag("JP") },
  { code: "JO", name: "Jordan", timezone: "Asia/Amman", flag: getCountryFlag("JO") },
  { code: "KZ", name: "Kazakhstan", timezone: "Asia/Almaty", flag: getCountryFlag("KZ") },
  { code: "KE", name: "Kenya", timezone: "Africa/Nairobi", flag: getCountryFlag("KE") },
  { code: "KR", name: "South Korea", timezone: "Asia/Seoul", flag: getCountryFlag("KR") },
  { code: "KW", name: "Kuwait", timezone: "Asia/Kuwait", flag: getCountryFlag("KW") },
  { code: "KG", name: "Kyrgyzstan", timezone: "Asia/Bishkek", flag: getCountryFlag("KG") },
  { code: "LA", name: "Laos", timezone: "Asia/Vientiane", flag: getCountryFlag("LA") },
  { code: "LV", name: "Latvia", timezone: "Europe/Riga", flag: getCountryFlag("LV") },
  { code: "LB", name: "Lebanon", timezone: "Asia/Beirut", flag: getCountryFlag("LB") },
  { code: "LT", name: "Lithuania", timezone: "Europe/Vilnius", flag: getCountryFlag("LT") },
  { code: "LU", name: "Luxembourg", timezone: "Europe/Luxembourg", flag: getCountryFlag("LU") },
  { code: "MY", name: "Malaysia", timezone: "Asia/Kuala_Lumpur", flag: getCountryFlag("MY") },
  { code: "MT", name: "Malta", timezone: "Europe/Malta", flag: getCountryFlag("MT") },
  { code: "MX", name: "Mexico", timezone: "America/Mexico_City", flag: getCountryFlag("MX") },
  { code: "MD", name: "Moldova", timezone: "Europe/Chisinau", flag: getCountryFlag("MD") },
  { code: "MA", name: "Morocco", timezone: "Africa/Casablanca", flag: getCountryFlag("MA") },
  { code: "MM", name: "Myanmar", timezone: "Asia/Yangon", flag: getCountryFlag("MM") },
  { code: "NP", name: "Nepal", timezone: "Asia/Kathmandu", flag: getCountryFlag("NP") },
  { code: "NL", name: "Netherlands", timezone: "Europe/Amsterdam", flag: getCountryFlag("NL") },
  { code: "NZ", name: "New Zealand", timezone: "Pacific/Auckland", flag: getCountryFlag("NZ") },
  { code: "NI", name: "Nicaragua", timezone: "America/Managua", flag: getCountryFlag("NI") },
  { code: "NG", name: "Nigeria", timezone: "Africa/Lagos", flag: getCountryFlag("NG") },
  { code: "NO", name: "Norway", timezone: "Europe/Oslo", flag: getCountryFlag("NO") },
  { code: "OM", name: "Oman", timezone: "Asia/Muscat", flag: getCountryFlag("OM") },
  { code: "PK", name: "Pakistan", timezone: "Asia/Karachi", flag: getCountryFlag("PK") },
  { code: "PA", name: "Panama", timezone: "America/Panama", flag: getCountryFlag("PA") },
  { code: "PY", name: "Paraguay", timezone: "America/Asuncion", flag: getCountryFlag("PY") },
  { code: "PE", name: "Peru", timezone: "America/Lima", flag: getCountryFlag("PE") },
  { code: "PH", name: "Philippines", timezone: "Asia/Manila", flag: getCountryFlag("PH") },
  { code: "PL", name: "Poland", timezone: "Europe/Warsaw", flag: getCountryFlag("PL") },
  { code: "PT", name: "Portugal", timezone: "Europe/Lisbon", flag: getCountryFlag("PT") },
  { code: "PR", name: "Puerto Rico", timezone: "America/Puerto_Rico", flag: getCountryFlag("PR") },
  { code: "QA", name: "Qatar", timezone: "Asia/Qatar", flag: getCountryFlag("QA") },
  { code: "RO", name: "Romania", timezone: "Europe/Bucharest", flag: getCountryFlag("RO") },
  { code: "RU", name: "Russia", timezone: "Europe/Moscow", flag: getCountryFlag("RU") },
  { code: "SA", name: "Saudi Arabia", timezone: "Asia/Riyadh", flag: getCountryFlag("SA") },
  { code: "RS", name: "Serbia", timezone: "Europe/Belgrade", flag: getCountryFlag("RS") },
  { code: "SG", name: "Singapore", timezone: "Asia/Singapore", flag: getCountryFlag("SG") },
  { code: "SK", name: "Slovakia", timezone: "Europe/Bratislava", flag: getCountryFlag("SK") },
  { code: "SI", name: "Slovenia", timezone: "Europe/Ljubljana", flag: getCountryFlag("SI") },
  { code: "ZA", name: "South Africa", timezone: "Africa/Johannesburg", flag: getCountryFlag("ZA") },
  { code: "ES", name: "Spain", timezone: "Europe/Madrid", flag: getCountryFlag("ES") },
  { code: "LK", name: "Sri Lanka", timezone: "Asia/Colombo", flag: getCountryFlag("LK") },
  { code: "SE", name: "Sweden", timezone: "Europe/Stockholm", flag: getCountryFlag("SE") },
  { code: "CH", name: "Switzerland", timezone: "Europe/Zurich", flag: getCountryFlag("CH") },
  { code: "SY", name: "Syria", timezone: "Asia/Damascus", flag: getCountryFlag("SY") },
  { code: "TW", name: "Taiwan", timezone: "Asia/Taipei", flag: getCountryFlag("TW") },
  { code: "TZ", name: "Tanzania", timezone: "Africa/Dar_es_Salaam", flag: getCountryFlag("TZ") },
  { code: "TH", name: "Thailand", timezone: "Asia/Bangkok", flag: getCountryFlag("TH") },
  { code: "TN", name: "Tunisia", timezone: "Africa/Tunis", flag: getCountryFlag("TN") },
  { code: "TR", name: "Turkey", timezone: "Europe/Istanbul", flag: getCountryFlag("TR") },
  { code: "UA", name: "Ukraine", timezone: "Europe/Kyiv", flag: getCountryFlag("UA") },
  { code: "AE", name: "United Arab Emirates", timezone: "Asia/Dubai", flag: getCountryFlag("AE") },
  { code: "GB", name: "United Kingdom", timezone: "Europe/London", flag: getCountryFlag("GB") },
  { code: "US", name: "United States", timezone: "America/New_York", flag: getCountryFlag("US") },
  { code: "UY", name: "Uruguay", timezone: "America/Montevideo", flag: getCountryFlag("UY") },
  { code: "UZ", name: "Uzbekistan", timezone: "Asia/Tashkent", flag: getCountryFlag("UZ") },
  { code: "VE", name: "Venezuela", timezone: "America/Caracas", flag: getCountryFlag("VE") },
  { code: "VN", name: "Vietnam", timezone: "Asia/Ho_Chi_Minh", flag: getCountryFlag("VN") },
  { code: "YE", name: "Yemen", timezone: "Asia/Aden", flag: getCountryFlag("YE") },
].sort((a, b) => a.name.localeCompare(b.name));

