// Export download utilities

/**
 * Download a text file (CSV, TXT, etc.)
 */
export function downloadTextFile(filename: string, content: string, mimeType = 'text/csv') {
    const blob = new Blob([content], { type: mimeType });
    downloadBlobFile(filename, blob);
}

/**
 * Download a Blob as a file
 */
export function downloadBlobFile(filename: string, blob: Blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Download JSON data as a file
 */
export function downloadJSON(filename: string, data: unknown) {
    const json = JSON.stringify(data, null, 2);
    downloadTextFile(filename, json, 'application/json');
}

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV<T extends Record<string, unknown>>(data: T[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows: string[] = [];

    // Header row
    csvRows.push(headers.join(','));

    // Data rows
    for (const row of data) {
        const values = headers.map((header) => {
            const value = row[header];
            // Escape quotes and wrap in quotes if contains comma or quote
            const stringValue = String(value ?? '').replace(/"/g, '""');
            return stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')
                ? `"${stringValue}"`
                : stringValue;
        });
        csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
}

/**
 * Format date for filenames
 */
export function formatDateForFilename(date: Date = new Date()): string {
    return date.toISOString().split('T')[0];
}
