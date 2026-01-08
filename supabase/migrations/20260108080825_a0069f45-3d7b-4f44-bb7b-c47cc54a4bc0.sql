-- Create profiles table for user data
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    referral_code TEXT UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
    referred_by UUID REFERENCES public.profiles(id),
    premium_until TIMESTAMP WITH TIME ZONE,
    total_earnings NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create game_ratings table
CREATE TABLE public.game_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(game_id, user_id)
);

-- Create leaderboard_entries table for content creators
CREATE TABLE public.leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_count INTEGER DEFAULT 0,
    total_earnings NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- Enable realtime for chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Profiles policies
CREATE POLICY "Profiles are publicly readable" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Chat messages policies
CREATE POLICY "Chat messages are publicly readable" ON public.chat_messages
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can send messages" ON public.chat_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages" ON public.chat_messages
    FOR DELETE USING (auth.uid() = user_id);

-- Game ratings policies
CREATE POLICY "Ratings are publicly readable" ON public.game_ratings
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can rate games" ON public.game_ratings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rating" ON public.game_ratings
    FOR UPDATE USING (auth.uid() = user_id);

-- Leaderboard policies
CREATE POLICY "Leaderboard is publicly readable" ON public.leaderboard_entries
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own entry" ON public.leaderboard_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own entry" ON public.leaderboard_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    referrer_id UUID;
    referrer_code TEXT;
BEGIN
    -- Check if there's a referral code in metadata
    referrer_code := NEW.raw_user_meta_data->>'referral_code';
    
    IF referrer_code IS NOT NULL THEN
        SELECT id INTO referrer_id FROM public.profiles WHERE referral_code = referrer_code;
    END IF;
    
    -- Create profile
    INSERT INTO public.profiles (user_id, display_name, referred_by, premium_until)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        referrer_id,
        CASE WHEN referrer_id IS NOT NULL THEN now() + interval '3 days' ELSE NULL END
    );
    
    -- Update referrer's stats if applicable
    IF referrer_id IS NOT NULL THEN
        INSERT INTO public.leaderboard_entries (user_id, referral_count, total_earnings)
        VALUES (referrer_id, 1, 0.50)
        ON CONFLICT (user_id) DO UPDATE SET 
            referral_count = leaderboard_entries.referral_count + 1,
            total_earnings = leaderboard_entries.total_earnings + 0.50,
            updated_at = now();
            
        UPDATE public.profiles 
        SET total_earnings = total_earnings + 0.50
        WHERE id = referrer_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add unique constraint for leaderboard
ALTER TABLE public.leaderboard_entries ADD CONSTRAINT leaderboard_user_unique UNIQUE (user_id);

-- Create trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update timestamps
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leaderboard_updated_at
    BEFORE UPDATE ON public.leaderboard_entries
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();