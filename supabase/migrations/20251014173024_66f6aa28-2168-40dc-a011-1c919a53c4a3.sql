-- Create quest_timer_sessions table
CREATE TABLE public.quest_timer_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  quest_id uuid NOT NULL,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  ended_at timestamp with time zone,
  duration_seconds integer,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quest_timer_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own timer sessions"
ON public.quest_timer_sessions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own timer sessions"
ON public.quest_timer_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own timer sessions"
ON public.quest_timer_sessions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own timer sessions"
ON public.quest_timer_sessions
FOR DELETE
USING (auth.uid() = user_id);