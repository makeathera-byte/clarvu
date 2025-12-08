import { create } from 'zustand';

export interface Category {
    id: string;
    name: string;
    color: string;
    type: string;
}

// Helper to deduplicate categories by name (case-insensitive)
function deduplicateCategories(categories: Category[]): Category[] {
    const seen = new Set<string>();
    return categories.filter((cat) => {
        const normalizedName = cat.name.toLowerCase().trim();
        if (seen.has(normalizedName)) {
            return false;
        }
        seen.add(normalizedName);
        return true;
    });
}

interface CategoryState {
    categories: Category[];
    isLoading: boolean;
    isInitialized: boolean;
    setFromServer: (categories: Category[]) => void;
    addOrUpdate: (category: Category) => void;
    remove: (id: string) => void;
    setLoading: (loading: boolean) => void;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
    categories: [],
    isLoading: false,
    isInitialized: false,

    setFromServer: (categories) => set({
        // Always deduplicate when setting from server
        categories: deduplicateCategories(categories),
        isLoading: false,
        isInitialized: true
    }),

    addOrUpdate: (category) =>
        set((state) => {
            // Check if category with same name already exists
            const existingByName = state.categories.find(
                (c) => c.name.toLowerCase().trim() === category.name.toLowerCase().trim()
            );

            if (existingByName && existingByName.id !== category.id) {
                // Don't add duplicate by name
                return state;
            }

            const existingIndex = state.categories.findIndex((c) => c.id === category.id);
            if (existingIndex >= 0) {
                // Update existing
                const newCategories = [...state.categories];
                newCategories[existingIndex] = category;
                return { categories: newCategories };
            }
            // Add new
            return { categories: [...state.categories, category] };
        }),

    remove: (id) =>
        set((state) => ({
            categories: state.categories.filter((c) => c.id !== id),
        })),

    setLoading: (isLoading) => set({ isLoading }),
}));
