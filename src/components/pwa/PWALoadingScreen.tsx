'use client';

import { useEffect, useState } from 'react';

export function PWALoadingScreen() {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Hide loading screen after content is ready
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 100);

        // Force hide after max delay
        const maxTimer = setTimeout(() => {
            setIsVisible(false);
        }, 3000);

        return () => {
            clearTimeout(timer);
            clearTimeout(maxTimer);
        };
    }, []);

    if (!isVisible) return null;

    return (
        <div
            id="pwa-loading-screen"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: '#0b0b0b',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                transition: 'opacity 0.3s ease-out',
            }}
        >
            {/* Logo */}
            <div style={{ marginBottom: '2rem' }}>
                <img
                    src="/clarvu-icon.png"
                    alt="Clarvu"
                    style={{ width: '80px', height: '80px', borderRadius: '16px' }}
                />
            </div>

            {/* App Name */}
            <h1
                style={{
                    color: '#ffffff',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    marginBottom: '1rem',
                }}
            >
                Clarvu
            </h1>

            {/* Loading spinner */}
            <div
                style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid rgba(16, 185, 129, 0.2)',
                    borderTop: '3px solid #10b981',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                }}
            />

            <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}
