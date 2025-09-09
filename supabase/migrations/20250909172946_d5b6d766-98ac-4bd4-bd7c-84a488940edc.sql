-- Add missing vitality and mana columns to user_stats table
ALTER TABLE public.user_stats 
ADD COLUMN IF NOT EXISTS vitality integer NOT NULL DEFAULT 100,
ADD COLUMN IF NOT EXISTS mana integer NOT NULL DEFAULT 100;

-- Update any existing records to have default values
UPDATE public.user_stats 
SET vitality = 100, mana = 100 
WHERE vitality IS NULL OR mana IS NULL;