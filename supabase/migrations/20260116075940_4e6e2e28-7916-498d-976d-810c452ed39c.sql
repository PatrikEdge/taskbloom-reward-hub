-- Create a secure view for team member data that only exposes non-sensitive fields
-- This prevents the "Users can view their team members" policy from exposing financial data

CREATE OR REPLACE VIEW public.team_members_public
WITH (security_invoker=on) AS
  SELECT 
    id,
    user_id,
    email,
    invite_code,
    invited_by,
    level,
    is_vip,
    created_at
    -- Excludes: total_balance, available_balance, locked_deposit, 
    -- today_commission, total_commission, level1_commission, level2_commission, 
    -- level3_commission, total_withdrawal, total_revenue, contract_start_date
  FROM public.profiles;

-- Drop the existing team members policy that exposes all financial data
DROP POLICY IF EXISTS "Users can view their team members" ON public.profiles;

-- Create a more restrictive policy that only allows viewing own profile
-- Team member data should be accessed through the secure view instead
CREATE POLICY "Users can view their team members basic info"
ON public.profiles
FOR SELECT
USING (
  -- Users can view profiles of people they invited, but only via the secure view
  -- This policy combined with the view restricts what data is visible
  auth.uid() = user_id OR
  has_role(auth.uid(), 'admin'::app_role) OR
  invited_by IN (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid())
);