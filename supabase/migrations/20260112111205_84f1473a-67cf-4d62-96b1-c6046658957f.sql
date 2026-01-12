-- Create transactions table for deposits and withdrawals
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
  amount numeric NOT NULL CHECK (amount > 0),
  wallet_address text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  processed_at timestamp with time zone,
  processed_by uuid REFERENCES auth.users(id)
);

-- Enable RLS on transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view their own transactions"
ON public.transactions FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own transactions
CREATE POLICY "Users can insert their own transactions"
ON public.transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create user roles table for admin
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Admin can view all user roles
CREATE POLICY "Admins can view all user roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Users can view their own role
CREATE POLICY "Users can view their own role"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- Admin policies for transactions
CREATE POLICY "Admins can view all transactions"
ON public.transactions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update transactions"
ON public.transactions FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for profiles (to view all users)
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for task_completions
CREATE POLICY "Admins can view all task completions"
ON public.task_completions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Function to process withdrawal
CREATE OR REPLACE FUNCTION public.process_withdrawal(_transaction_id uuid, _approved boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
  _amount numeric;
  _status text;
BEGIN
  -- Get transaction details
  SELECT user_id, amount, status INTO _user_id, _amount, _status
  FROM transactions WHERE id = _transaction_id;
  
  IF _status != 'pending' THEN
    RAISE EXCEPTION 'Transaction already processed';
  END IF;
  
  IF _approved THEN
    -- Check if user has enough balance
    IF (SELECT available_balance FROM profiles WHERE user_id = _user_id) < _amount THEN
      RAISE EXCEPTION 'Insufficient balance';
    END IF;
    
    -- Deduct from user balance
    UPDATE profiles SET
      available_balance = available_balance - _amount,
      total_balance = total_balance - _amount,
      total_withdrawal = total_withdrawal + _amount
    WHERE user_id = _user_id;
    
    -- Update transaction status
    UPDATE transactions SET 
      status = 'approved',
      processed_at = now(),
      processed_by = auth.uid()
    WHERE id = _transaction_id;
  ELSE
    -- Reject transaction
    UPDATE transactions SET 
      status = 'rejected',
      processed_at = now(),
      processed_by = auth.uid()
    WHERE id = _transaction_id;
  END IF;
END;
$$;

-- Function to process deposit
CREATE OR REPLACE FUNCTION public.process_deposit(_transaction_id uuid, _approved boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
  _amount numeric;
  _status text;
  _current_level integer;
  _new_level integer;
BEGIN
  -- Get transaction details
  SELECT user_id, amount, status INTO _user_id, _amount, _status
  FROM transactions WHERE id = _transaction_id;
  
  IF _status != 'pending' THEN
    RAISE EXCEPTION 'Transaction already processed';
  END IF;
  
  IF _approved THEN
    -- Get current level
    SELECT level INTO _current_level FROM profiles WHERE user_id = _user_id;
    
    -- Determine new level based on deposit amount
    -- LV0: 0, LV1: 100, LV2: 500, LV3: 1000, LV4: 3000
    SELECT CASE
      WHEN _amount >= 3000 THEN 4
      WHEN _amount >= 1000 THEN 3
      WHEN _amount >= 500 THEN 2
      WHEN _amount >= 100 THEN 1
      ELSE 0
    END INTO _new_level;
    
    -- Update user balance and level (take the higher level)
    UPDATE profiles SET
      available_balance = available_balance + _amount,
      total_balance = total_balance + _amount,
      locked_deposit = locked_deposit + _amount,
      level = GREATEST(level, _new_level),
      contract_start_date = COALESCE(contract_start_date, now())
    WHERE user_id = _user_id;
    
    -- Update transaction status
    UPDATE transactions SET 
      status = 'approved',
      processed_at = now(),
      processed_by = auth.uid()
    WHERE id = _transaction_id;
  ELSE
    -- Reject transaction
    UPDATE transactions SET 
      status = 'rejected',
      processed_at = now(),
      processed_by = auth.uid()
    WHERE id = _transaction_id;
  END IF;
END;
$$;