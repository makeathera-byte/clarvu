'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { signOut } from '@/app/auth/actions/googleAuth';
import Image from 'next/image';

interface UserProfileProps {
    user: {
        email?: string | null;
        avatar?: string | null;
        name?: string | null;
    };
}

export function UserProfile({ user }: UserProfileProps) {
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            const result = await signOut();
            if (result.success) {
                router.push('/auth/login');
                router.refresh();
            }
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <div className="flex items-center gap-3">
            {/* User Avatar */}
            {user.avatar ? (
                <Image
                    src={user.avatar}
                    alt={user.name || user.email || 'User'}
                    width={32}
                    height={32}
                    className="rounded-full"
                />
            ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-medium text-sm">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
            )}

            {/* User Email */}
            <div className="hidden md:flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                    {user.name || user.email?.split('@')[0]}
                </span>
                <span className="text-xs text-gray-500">{user.email}</span>
            </div>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
        </div>
    );
}
