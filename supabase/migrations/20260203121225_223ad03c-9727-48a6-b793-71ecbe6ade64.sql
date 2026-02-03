-- Create a function to get weekly leaderboard data
-- Calculates XP earned from quest completions since Sunday 23:59 IST

CREATE OR REPLACE FUNCTION public.get_weekly_leaderboard()
RETURNS TABLE (
  user_id uuid,
  display_name text,
  avatar_url text,
  weekly_xp bigint,
  rank bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  week_start_utc timestamp with time zone;
BEGIN
  -- Calculate the start of the current week (Sunday 23:59 IST = Sunday 18:29 UTC)
  -- IST is UTC+5:30, so Sunday 23:59 IST = Sunday 18:29 UTC
  week_start_utc := date_trunc('week', now() AT TIME ZONE 'Asia/Kolkata') 
                    - interval '1 second' 
                    + interval '23 hours 59 minutes'
                    - interval '5 hours 30 minutes';
  
  -- If we're before Sunday 23:59 IST of current week, use previous week's start
  IF now() < week_start_utc THEN
    week_start_utc := week_start_utc - interval '7 days';
  END IF;

  RETURN QUERY
  WITH weekly_completions AS (
    SELECT 
      qc.user_id,
      COALESCE(SUM(q.xp), 0) as total_xp
    FROM quest_completions qc
    INNER JOIN quests q ON q.id = qc.quest_id
    WHERE qc.created_at >= week_start_utc
    GROUP BY qc.user_id
  ),
  user_data AS (
    SELECT 
      p.user_id,
      COALESCE(p.display_name, 'Anonymous') as display_name,
      p.avatar_url,
      COALESCE(wc.total_xp, 0) as weekly_xp
    FROM profiles p
    LEFT JOIN weekly_completions wc ON wc.user_id = p.user_id
  )
  SELECT 
    ud.user_id,
    ud.display_name,
    ud.avatar_url,
    ud.weekly_xp,
    ROW_NUMBER() OVER (ORDER BY ud.weekly_xp DESC, ud.display_name ASC) as rank
  FROM user_data ud
  WHERE ud.weekly_xp > 0
  ORDER BY ud.weekly_xp DESC, ud.display_name ASC;
END;
$$;