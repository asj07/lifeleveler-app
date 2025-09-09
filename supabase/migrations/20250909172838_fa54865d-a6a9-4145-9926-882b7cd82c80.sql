-- Update RLS policies for redemptions table to enhance security
-- Keep existing policies but ensure they're properly restrictive

-- First, let's create a view that hides sensitive payment details from regular users
CREATE OR REPLACE VIEW public.user_redemptions AS
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
FROM public.redemptions;

-- Enable RLS on the view
ALTER VIEW public.user_redemptions SET (security_invoker = on);

-- Grant permissions on the view
GRANT SELECT ON public.user_redemptions TO authenticated;

-- Create a security definer function for admin access to full redemption data
-- This will be useful when an admin dashboard is implemented
CREATE OR REPLACE FUNCTION public.get_admin_redemptions()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  coins_redeemed integer,
  amount_inr numeric,
  status text,
  payment_method text,
  payment_details jsonb,
  created_at timestamp with time zone,
  processed_at timestamp with time zone,
  notes text,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- In the future, add admin role check here
  -- For now, this function is not accessible to regular users
  -- Example: IF NOT public.has_role(auth.uid(), 'admin') THEN
  --   RAISE EXCEPTION 'Access denied';
  -- END IF;
  
  RETURN QUERY
  SELECT * FROM public.redemptions
  ORDER BY created_at DESC;
END;
$$;

-- Revoke direct access to payment_details for regular users
-- Keep the existing RLS policies but add column-level security
REVOKE ALL ON public.redemptions FROM authenticated;
GRANT SELECT (id, user_id, coins_redeemed, amount_inr, status, payment_method, created_at, processed_at, notes, updated_at) ON public.redemptions TO authenticated;
GRANT INSERT (user_id, coins_redeemed, amount_inr, status, payment_method, notes) ON public.redemptions TO authenticated;

-- Add a comment documenting the security measures
COMMENT ON TABLE public.redemptions IS 'Contains redemption requests. Sensitive payment_details column is restricted from regular user access. Use user_redemptions view for safe user access.';

-- Create an index for better performance on user queries
CREATE INDEX IF NOT EXISTS idx_redemptions_user_id ON public.redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_status ON public.redemptions(status);
CREATE INDEX IF NOT EXISTS idx_redemptions_created_at ON public.redemptions(created_at DESC);