'use client';

import { useEffect } from 'react';
import { useCategoryStore, Category } from '@/lib/store/useCategoryStore';

interface CategoryStoreInitializerProps {
    categories: Category[];
}

export function CategoryStoreInitializer({ categories }: CategoryStoreInitializerProps) {
    const setFromServer = useCategoryStore((s) => s.setFromServer);

    // Always update categories when they change from server
    useEffect(() => {
        if (categories.length > 0) {
            setFromServer(categories);
        }
    }, [categories, setFromServer]);

    return null;
}
