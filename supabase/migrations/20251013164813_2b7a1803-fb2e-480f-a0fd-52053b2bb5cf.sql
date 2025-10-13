-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role public.app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Only admins can manage roles (will be enforced via Edge Function later)
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
);

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Update the admin redemptions function to require admin role
CREATE OR REPLACE FUNCTION public.get_admin_redemptions()
RETURNS TABLE(
  id UUID,
  user_id UUID,
  coins_redeemed INTEGER,
  amount_inr NUMERIC,
  status TEXT,
  payment_method TEXT,
  payment_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  processed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Check if user has admin role
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  RETURN QUERY
  SELECT * FROM public.redemptions
  ORDER BY created_at DESC;
END;
$function$;

-- Drop the existing user_redemptions view
DROP VIEW IF EXISTS public.user_redemptions;

-- Recreate user_redemptions view with proper user filtering
CREATE VIEW public.user_redemptions
WITH (security_invoker = on)
AS
  SELECT 
    id,
    user_id,
    coins_redeemed,
    amount_inr,
    status,
    payment_method,
    created_at,
    processed_at,
    notes,
    updated_at
  FROM public.redemptions
  WHERE user_id = auth.uid();

-- Add UPDATE and DELETE policies for redemptions
CREATE POLICY "Users can cancel pending redemptions"
ON public.redemptions
FOR DELETE
USING (
  auth.uid() = user_id 
  AND status = 'pending'
);

CREATE POLICY "Admins can update redemptions"
ON public.redemptions
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));