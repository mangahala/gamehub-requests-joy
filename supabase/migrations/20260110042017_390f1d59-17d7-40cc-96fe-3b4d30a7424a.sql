-- Fix the handle_new_user function to properly handle referrals
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    referrer_profile_id UUID;
    referrer_code TEXT;
BEGIN
    -- Check if there's a referral code in metadata
    referrer_code := NEW.raw_user_meta_data->>'referral_code';
    
    IF referrer_code IS NOT NULL AND referrer_code != '' THEN
        SELECT id INTO referrer_profile_id FROM public.profiles WHERE referral_code = referrer_code;
    END IF;
    
    -- Create profile
    INSERT INTO public.profiles (user_id, display_name, referred_by, premium_until)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        referrer_profile_id,
        CASE WHEN referrer_profile_id IS NOT NULL THEN now() + interval '3 days' ELSE NULL END
    );
    
    -- Update referrer's stats if applicable
    IF referrer_profile_id IS NOT NULL THEN
        INSERT INTO public.leaderboard_entries (user_id, referral_count, total_earnings)
        SELECT p.user_id, 1, 0.50
        FROM public.profiles p WHERE p.id = referrer_profile_id
        ON CONFLICT (user_id) DO UPDATE SET 
            referral_count = leaderboard_entries.referral_count + 1,
            total_earnings = leaderboard_entries.total_earnings + 0.50,
            updated_at = now();
            
        UPDATE public.profiles 
        SET total_earnings = COALESCE(total_earnings, 0) + 0.50
        WHERE id = referrer_profile_id;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Add is_banned column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;

-- Create RDP credentials table for premium users
CREATE TABLE IF NOT EXISTS public.rdp_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ip_address TEXT NOT NULL,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id)
);

-- Enable RLS on rdp_credentials
ALTER TABLE public.rdp_credentials ENABLE ROW LEVEL SECURITY;

-- Users can view their own RDP credentials
CREATE POLICY "Users can view their own RDP credentials"
ON public.rdp_credentials
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can insert RDP credentials
CREATE POLICY "Admins can insert RDP credentials"
ON public.rdp_credentials
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update RDP credentials
CREATE POLICY "Admins can update RDP credentials"
ON public.rdp_credentials
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete RDP credentials
CREATE POLICY "Admins can delete RDP credentials"
ON public.rdp_credentials
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add unique constraint on leaderboard_entries user_id if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leaderboard_entries_user_id_key') THEN
        ALTER TABLE public.leaderboard_entries ADD CONSTRAINT leaderboard_entries_user_id_key UNIQUE (user_id);
    END IF;
END $$;