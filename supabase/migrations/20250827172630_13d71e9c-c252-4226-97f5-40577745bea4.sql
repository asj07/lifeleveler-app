-- Fix function search path security warnings
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  
  -- Create initial stats
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  
  -- Create default quests
  INSERT INTO public.quests (user_id, title, category, xp, type) VALUES
    (NEW.id, 'Move 20 minutes', 'Health', 20, 'daily'),
    (NEW.id, '8 glasses of water', 'Health', 15, 'daily'),
    (NEW.id, 'Sleep 7+ hours', 'Health', 25, 'daily'),
    (NEW.id, 'Track spending today', 'Wealth', 15, 'daily'),
    (NEW.id, 'Learn a skill 30 min', 'Wealth', 25, 'daily'),
    (NEW.id, 'Build income 30 min', 'Wealth', 25, 'daily'),
    (NEW.id, 'Send 1 gratitude msg', 'Relationships', 15, 'daily'),
    (NEW.id, 'One deep conversation', 'Relationships', 25, 'daily'),
    (NEW.id, 'Kindness: no gossip', 'Relationships', 20, 'daily');
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;