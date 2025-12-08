'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { useEffect, useState } from 'react';

interface TileAssemblyProps {
    onComplete?: () => void;
    tileCount?: number;
}

export function TileAssembly({ onComplete, tileCount = 25 }: TileAssemblyProps) {
    const { currentTheme } = useTheme();
    const [tiles, setTiles] = useState<Array<{ id: number; x: number; y: number; scale: number; rotation: number }>>([]);

    useEffect(() => {
        // Generate random starting positions for tiles
        const generatedTiles = Array.from({ length: tileCount }, (_, i) => ({
            id: i,
            x: (Math.random() - 0.5) * window.innerWidth * 2,
            y: (Math.random() - 0.5) * window.innerHeight * 2,
            scale: Math.random() * 0.5 + 0.5,
            rotation: Math.random() * 360 - 180,
        }));
        setTiles(generatedTiles);

        // Trigger completion callback
        const timer = setTimeout(() => {
            onComplete?.();
        }, 1200);

        return () => clearTimeout(timer);
    }, [tileCount, onComplete]);

    const tileColors = [
        currentTheme.tiles.tile1,
        currentTheme.tiles.tile2,
        currentTheme.tiles.tile3,
        currentTheme.tiles.tile4,
        currentTheme.tiles.tile5,
    ];

    // Calculate grid layout
    const cols = 5;
    const rows = Math.ceil(tileCount / cols);
    const tileSize = Math.min(window.innerWidth / (cols + 2), 100);
    const gridWidth = cols * tileSize;
    const gridHeight = rows * tileSize;
    const startX = (window.innerWidth - gridWidth) / 2;
    const startY = (window.innerHeight - gridHeight) / 2;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
            {/* Background overlay */}
            <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ delay: 0.9, duration: 0.3 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Tiles */}
            {tiles.map((tile, index) => {
                const col = index % cols;
                const row = Math.floor(index / cols);
                const finalX = startX + col * tileSize;
                const finalY = startY + row * tileSize;
                const delay = (row * cols + col) * 0.02;

                return (
                    <motion.div
                        key={tile.id}
                        initial={{
                            x: tile.x,
                            y: tile.y,
                            scale: tile.scale,
                            rotate: tile.rotation,
                            opacity: 0,
                        }}
                        animate={{
                            x: finalX,
                            y: finalY,
                            scale: 1,
                            rotate: 0,
                            opacity: [0, 1, 1, 0.8],
                        }}
                        transition={{
                            type: 'spring',
                            damping: 20,
                            stiffness: 150,
                            delay: delay,
                            opacity: {
                                times: [0, 0.2, 0.8, 1],
                                duration: 1.2 - delay,
                            },
                        }}
                        style={{
                            position: 'absolute',
                            width: tileSize - 8,
                            height: tileSize - 8,
                            borderRadius: 16,
                            backgroundColor: tileColors[index % tileColors.length],
                            backdropFilter: 'blur(8px)',
                            border: `1px solid ${currentTheme.colors.border}`,
                            boxShadow: `0 4px 20px ${currentTheme.colors.primary}20`,
                        }}
                    />
                );
            })}
        </div>
    );
}
