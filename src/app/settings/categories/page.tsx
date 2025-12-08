'use client';

// Force dynamic rendering since parent layout uses cookies for authentication
export const dynamic = 'force-dynamic';

import { useState, useEffect, useTransition } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { useCategoryStore } from '@/lib/store/useCategoryStore';
import { Layers, Plus, Trash2, Check, X, Edit2, Shield, RotateCcw } from 'lucide-react';
import { getCategories, createCategoryAction, updateCategoryAction, deleteCategoryAction } from '../actions';
import { resetToDefaultCategories } from './resetCategories';

const COLORS = [
    '#2563eb', '#22c55e', '#8b5cf6', '#6b7280',
    '#4f46e5', '#facc15', '#fb923c', '#ef4444',
    '#ec4899', '#14b8a6', '#f97316', '#06b6d4'
];

interface Category {
    id: string;
    name: string;
    color: string;
    type?: string;
}

export default function CategoriesSettingsPage() {
    const { currentTheme } = useTheme();
    const categoryStore = useCategoryStore();
    const [categories, setCategories] = useState<Category[]>([]);
    const [newName, setNewName] = useState('');
    const [newColor, setNewColor] = useState(COLORS[0]);
    const [isPending, startTransition] = useTransition();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        const result = await getCategories();
        if (result.categories) {
            setCategories(result.categories);
            // Sync with global store - this ensures all components update
            categoryStore.setFromServer(result.categories);
        }
    };

    const handleCreate = () => {
        if (!newName.trim()) return;
        startTransition(async () => {
            const result = await createCategoryAction({ name: newName, color: newColor });
            if (result.success) {
                setNewName('');
                await loadCategories();
                // Store is already synced via loadCategories, but ensure it's updated
                if (result.category) {
                    categoryStore.addOrUpdate(result.category);
                }
            }
        });
    };

    const handleDelete = (cat: Category) => {
        // Protect Waste/Distraction category from deletion
        const isWaste = cat.type === 'waste' ||
            cat.name.toLowerCase().includes('waste') ||
            cat.name.toLowerCase().includes('distraction');
        if (isWaste) {
            return;
        }
        startTransition(async () => {
            const result = await deleteCategoryAction(cat.id);
            if (result?.success !== false) {
                // Remove from store immediately for instant UI update
                categoryStore.remove(cat.id);
                await loadCategories();
            }
        });
    };

    const handleColorChange = (id: string, color: string) => {
        startTransition(async () => {
            const result = await updateCategoryAction(id, { color });
            if (result.success) {
                await loadCategories();
                // Store is already synced via loadCategories, but ensure it's updated
                if (result.category) {
                    categoryStore.addOrUpdate(result.category);
                }
            }
        });
    };

    const startEditing = (cat: Category) => {
        setEditingId(cat.id);
        setEditName(cat.name);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditName('');
    };

    const saveEditing = (id: string) => {
        if (!editName.trim()) {
            cancelEditing();
            return;
        }
        startTransition(async () => {
            const result = await updateCategoryAction(id, { name: editName.trim() });
            if (result.success) {
                setEditingId(null);
                await loadCategories();
                // Store is already synced via loadCategories, but ensure it's updated
                if (result.category) {
                    categoryStore.addOrUpdate(result.category);
                }
            }
        });
    };

    const isProtectedCategory = (cat: Category) => {
        return cat.type === 'waste' ||
            cat.name.toLowerCase().includes('waste') ||
            cat.name.toLowerCase().includes('distraction');
    };

    return (
        <main className="pt-8 lg:pt-8 px-4 sm:px-6 lg:px-8 pb-12">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${currentTheme.colors.primary}20` }}
                        >
                            <Layers className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                        </div>
                        <h1 className="text-2xl font-bold" style={{ color: currentTheme.colors.foreground }}>
                            Categories
                        </h1>
                    </div>
                    <p style={{ color: currentTheme.colors.mutedForeground }}>
                        Organize your tasks with custom categories
                    </p>

                    {/* Reset to Defaults Button */}
                    <button
                        onClick={async () => {
                            if (confirm('This will replace ALL your categories with the 8 default categories. Are you sure?')) {
                                startTransition(async () => {
                                    await resetToDefaultCategories();
                                    await loadCategories();
                                    // Store is already synced via loadCategories
                                });
                            }
                        }}
                        className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors hover:opacity-80"
                        style={{
                            backgroundColor: '#ef444415',
                            color: '#ef4444',
                        }}
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset to Default Categories
                    </button>
                </motion.div>

                {/* Add New Category */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-5 rounded-2xl border mb-6"
                    style={{ backgroundColor: currentTheme.colors.card, borderColor: currentTheme.colors.border }}
                >
                    <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: currentTheme.colors.foreground }}>
                        <Plus className="w-4 h-4" style={{ color: currentTheme.colors.primary }} />
                        Add New Category
                    </h2>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                            placeholder="Category name..."
                            className="flex-1 px-4 py-2.5 rounded-xl outline-none text-sm"
                            style={{
                                backgroundColor: currentTheme.colors.muted,
                                color: currentTheme.colors.foreground,
                                border: `1px solid ${currentTheme.colors.border}`
                            }}
                        />
                        <div className="flex gap-1">
                            {COLORS.slice(0, 6).map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setNewColor(c)}
                                    className="w-8 h-8 rounded-lg transition-transform hover:scale-110"
                                    style={{
                                        backgroundColor: c,
                                        boxShadow: newColor === c ? `0 0 0 2px ${currentTheme.colors.background}, 0 0 0 4px ${c}` : 'none'
                                    }}
                                />
                            ))}
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCreate}
                            disabled={isPending || !newName.trim()}
                            className="px-4 py-2.5 rounded-xl font-medium text-sm"
                            style={{
                                backgroundColor: newName.trim() ? currentTheme.colors.primary : currentTheme.colors.muted,
                                color: newName.trim() ? '#fff' : currentTheme.colors.mutedForeground
                            }}
                        >
                            Add
                        </motion.button>
                    </div>
                </motion.div>

                {/* Category List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-3"
                >
                    {categories.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-12 rounded-2xl border text-center"
                            style={{ backgroundColor: currentTheme.colors.card, borderColor: currentTheme.colors.border }}
                        >
                            <Layers className="w-12 h-12 mx-auto mb-3" style={{ color: currentTheme.colors.mutedForeground }} />
                            <p style={{ color: currentTheme.colors.mutedForeground }}>No categories yet</p>
                        </motion.div>
                    ) : (
                        <div className="grid gap-3">
                            {categories.map((cat, i) => {
                                const isEditing = editingId === cat.id;
                                const isProtected = isProtectedCategory(cat);

                                return (
                                    <motion.div
                                        key={cat.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="group relative p-4 rounded-xl border transition-all"
                                        style={{
                                            backgroundColor: currentTheme.colors.card,
                                            borderColor: currentTheme.colors.border,
                                            borderLeftWidth: '4px',
                                            borderLeftColor: cat.color,
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* Color indicator */}
                                            <div
                                                className="w-5 h-5 rounded-full flex-shrink-0 ring-2 ring-offset-2 transition-all"
                                                style={{
                                                    backgroundColor: cat.color,
                                                    borderColor: cat.color,
                                                }}
                                            />

                                            {/* Name (editable) */}
                                            <div className="flex-1 min-w-0">
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') saveEditing(cat.id);
                                                            if (e.key === 'Escape') cancelEditing();
                                                        }}
                                                        autoFocus
                                                        className="w-full px-3 py-1.5 rounded-lg text-sm font-medium outline-none transition-all"
                                                        style={{
                                                            backgroundColor: currentTheme.colors.muted,
                                                            color: currentTheme.colors.foreground,
                                                            border: `2px solid ${cat.color}`
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className="font-medium text-sm"
                                                            style={{ color: currentTheme.colors.foreground }}
                                                        >
                                                            {cat.name}
                                                        </span>
                                                        {isProtected && (
                                                            <Shield className="w-3.5 h-3.5 flex-shrink-0" style={{ color: currentTheme.colors.mutedForeground }} />
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Color picker (always visible, compact) */}
                                            <div className="flex gap-1.5">
                                                {COLORS.slice(0, 8).map((c) => (
                                                    <button
                                                        key={c}
                                                        onClick={() => handleColorChange(cat.id, c)}
                                                        className="w-6 h-6 rounded-md transition-all hover:scale-110 hover:ring-2"
                                                        style={{
                                                            backgroundColor: c,
                                                            boxShadow: cat.color === c
                                                                ? `0 0 0 2px ${currentTheme.colors.card}, 0 0 0 4px ${c}`
                                                                : 'none',
                                                        }}
                                                        title={`Change to ${c}`}
                                                    />
                                                ))}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-1">
                                                {isEditing ? (
                                                    <>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => saveEditing(cat.id)}
                                                            className="p-2 rounded-lg transition-colors"
                                                            style={{ backgroundColor: `${currentTheme.colors.primary}20` }}
                                                        >
                                                            <Check className="w-4 h-4" style={{ color: currentTheme.colors.primary }} />
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={cancelEditing}
                                                            className="p-2 rounded-lg transition-colors hover:bg-red-500/20"
                                                        >
                                                            <X className="w-4 h-4 text-red-500" />
                                                        </motion.button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => startEditing(cat)}
                                                            className="p-2 rounded-lg transition-colors"
                                                            style={{
                                                                backgroundColor: currentTheme.colors.muted,
                                                                color: currentTheme.colors.mutedForeground
                                                            }}
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </motion.button>
                                                        {!isProtected && (
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => handleDelete(cat)}
                                                                className="p-2 rounded-lg transition-colors hover:bg-red-500/20"
                                                            >
                                                                <Trash2 className="w-4 h-4 text-red-500" />
                                                            </motion.button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>

                {/* Help text */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-xs text-center mt-4"
                    style={{ color: currentTheme.colors.mutedForeground }}
                >
                    <Shield className="w-3 h-3 inline mr-1" />
                    Protected categories cannot be deleted
                </motion.p>
            </div>
        </main>
    );
}
