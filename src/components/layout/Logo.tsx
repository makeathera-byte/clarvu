'use client';

import Image from 'next/image';
import { useTheme } from '@/lib/theme/ThemeContext';

interface LogoProps {
    width?: number;
    height?: number;
    className?: string;
}

/**
 * Dynamic logo component that switches between logo variants based on theme
 * - Minimal White Theme: Uses logo with transparent background (dark text)
 * - All Other Themes: Uses logo with transparent background (white text)
 */
export function Logo({ width = 120, height = 32, className = '' }: LogoProps) {
    const { currentTheme } = useTheme();

    // Determine which logo to use based on theme
    const logoSrc = currentTheme.id === 'minimal'
        ? 'https://xrdxkgyynnzkbxtxoycl.supabase.co/storage/v1/object/public/logo/Transparent%20logo%201_1.png'
        : 'https://xrdxkgyynnzkbxtxoycl.supabase.co/storage/v1/object/public/logo/Transparent%201_1%20white.png';

    return (
        <Image
            src={logoSrc}
            alt="Clarvu Logo"
            width={width}
            height={height}
            className={className}
            priority
        />
    );
}
