-- Reset Categories to 8 Default Categories
-- Run this in Supabase SQL Editor

-- 1. Delete all your existing categories
DELETE FROM categories WHERE user_id = auth.uid();

-- 2. Insert new 8 default categories (using valid type values)
INSERT INTO categories (user_id, name, color, type, is_default) VALUES
    (auth.uid(), 'Business', '#2563eb', 'growth', true),
    (auth.uid(), 'Growth', '#22c55e', 'growth', true),
    (auth.uid(), 'Product / Build', '#8b5cf6', 'delivery', true),
    (auth.uid(), 'Operations / Admin', '#6b7280', 'admin', true),
    (auth.uid(), 'Learning / Skill', '#4f46e5', 'personal', true),
    (auth.uid(), 'Personal / Health', '#facc15', 'personal', true),
    (auth.uid(), 'Routine', '#fb923c', 'necessity', true),
    (auth.uid(), 'Waste / Distraction', '#ef4444', 'waste', true);

-- Verify the new categories
SELECT name, color, type FROM categories WHERE user_id = auth.uid() ORDER BY created_at;
