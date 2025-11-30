-- Add business_type enum
DO $$ BEGIN
  CREATE TYPE business_type_enum AS ENUM ('revenue', 'admin', 'learning', 'personal', 'break', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add business_type column to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS business_type business_type_enum DEFAULT 'other';

-- Update default categories with business types
UPDATE categories SET business_type = 'revenue' WHERE name = 'Work' AND user_id IS NULL;
UPDATE categories SET business_type = 'revenue' WHERE name = 'Deep Work' AND user_id IS NULL;
UPDATE categories SET business_type = 'admin' WHERE name = 'Admin' AND user_id IS NULL;
UPDATE categories SET business_type = 'personal' WHERE name = 'Personal' AND user_id IS NULL;
UPDATE categories SET business_type = 'break' WHERE name = 'Break' AND user_id IS NULL;
UPDATE categories SET business_type = 'other' WHERE name = 'Waste' AND user_id IS NULL;

-- Set default for any remaining NULL values
UPDATE categories SET business_type = 'other' WHERE business_type IS NULL;

