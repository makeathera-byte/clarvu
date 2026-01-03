import type { Metadata } from 'next';
import { DownloadClient } from './DownloadClient';

export const metadata: Metadata = {
    title: 'Download Clarvu — Desktop App',
    description: 'Install Clarvu like a desktop app — no App Store, no friction. Get started with one click from your browser.',
};

export default function DownloadPage() {
    return <DownloadClient />;
}
