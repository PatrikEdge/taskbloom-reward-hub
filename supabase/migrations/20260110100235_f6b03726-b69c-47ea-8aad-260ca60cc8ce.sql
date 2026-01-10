-- Add VIP status and team commission tracking to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_vip boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS level1_commission numeric NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS level2_commission numeric NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS level3_commission numeric NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS contract_start_date timestamp with time zone DEFAULT null;

-- Create a function to calculate team commissions when a user completes a task
CREATE OR REPLACE FUNCTION public.distribute_team_commission(
  _user_id uuid,
  _task_earnings numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  level1_inviter_id uuid;
  level2_inviter_id uuid;
  level3_inviter_id uuid;
  level1_commission numeric;
  level2_commission numeric;
  level3_commission numeric;
BEGIN
  -- Level 1: 3% of task earnings
  level1_commission := _task_earnings * 0.03;
  -- Level 2: 2% of task earnings
  level2_commission := _task_earnings * 0.02;
  -- Level 3: 1% of task earnings
  level3_commission := _task_earnings * 0.01;

  -- Find Level 1 inviter (direct inviter)
  SELECT p.user_id INTO level1_inviter_id
  FROM profiles p
  WHERE p.id = (
    SELECT invited_by FROM profiles WHERE user_id = _user_id
  );

  IF level1_inviter_id IS NOT NULL THEN
    -- Update Level 1 inviter
    UPDATE profiles SET
      level1_commission = profiles.level1_commission + level1_commission,
      total_commission = profiles.total_commission + level1_commission,
      today_commission = profiles.today_commission + level1_commission,
      available_balance = profiles.available_balance + level1_commission,
      total_balance = profiles.total_balance + level1_commission
    WHERE user_id = level1_inviter_id;

    -- Find Level 2 inviter (inviter of the inviter)
    SELECT p.user_id INTO level2_inviter_id
    FROM profiles p
    WHERE p.id = (
      SELECT invited_by FROM profiles WHERE user_id = level1_inviter_id
    );

    IF level2_inviter_id IS NOT NULL THEN
      -- Update Level 2 inviter
      UPDATE profiles SET
        level2_commission = profiles.level2_commission + level2_commission,
        total_commission = profiles.total_commission + level2_commission,
        today_commission = profiles.today_commission + level2_commission,
        available_balance = profiles.available_balance + level2_commission,
        total_balance = profiles.total_balance + level2_commission
      WHERE user_id = level2_inviter_id;

      -- Find Level 3 inviter
      SELECT p.user_id INTO level3_inviter_id
      FROM profiles p
      WHERE p.id = (
        SELECT invited_by FROM profiles WHERE user_id = level2_inviter_id
      );

      IF level3_inviter_id IS NOT NULL THEN
        -- Update Level 3 inviter
        UPDATE profiles SET
          level3_commission = profiles.level3_commission + level3_commission,
          total_commission = profiles.total_commission + level3_commission,
          today_commission = profiles.today_commission + level3_commission,
          available_balance = profiles.available_balance + level3_commission,
          total_balance = profiles.total_balance + level3_commission
        WHERE user_id = level3_inviter_id;
      END IF;
    END IF;
  END IF;
END;
$$;

-- Create a helper function to count team members at each level
CREATE OR REPLACE FUNCTION public.count_team_at_level(
  _profile_id uuid,
  _level integer
)
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result integer;
BEGIN
  IF _level = 1 THEN
    -- Direct invitees
    SELECT COUNT(*) INTO result FROM profiles WHERE invited_by = _profile_id;
  ELSIF _level = 2 THEN
    -- Invitees of invitees
    SELECT COUNT(*) INTO result FROM profiles 
    WHERE invited_by IN (SELECT id FROM profiles WHERE invited_by = _profile_id);
  ELSIF _level = 3 THEN
    -- Third level
    SELECT COUNT(*) INTO result FROM profiles 
    WHERE invited_by IN (
      SELECT id FROM profiles WHERE invited_by IN (
        SELECT id FROM profiles WHERE invited_by = _profile_id
      )
    );
  ELSE
    result := 0;
  END IF;
  
  RETURN result;
END;
$$;

-- Create a function to check VIP eligibility and upgrade
CREATE OR REPLACE FUNCTION public.check_vip_eligibility(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_level integer;
  user_profile_id uuid;
  level1_count integer;
  required_count integer;
BEGIN
  SELECT id, level INTO user_profile_id, user_level FROM profiles WHERE user_id = _user_id;
  
  -- Get level 1 team member count
  SELECT count_team_at_level(user_profile_id, 1) INTO level1_count;
  
  -- VIP requirements based on level
  -- LV1 -> sLV1(VIP): 2 Level 1 team members
  -- LV2 -> sLV2(VIP): 3 Level 1 team members
  -- LV3 -> sLV3(VIP): 4 Level 1 team members
  -- LV4 -> sLV4(VIP): 5 Level 1 team members
  CASE user_level
    WHEN 1 THEN required_count := 2;
    WHEN 2 THEN required_count := 3;
    WHEN 3 THEN required_count := 4;
    WHEN 4 THEN required_count := 5;
    ELSE required_count := 999;
  END CASE;
  
  IF level1_count >= required_count THEN
    UPDATE profiles SET is_vip = true WHERE user_id = _user_id;
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;