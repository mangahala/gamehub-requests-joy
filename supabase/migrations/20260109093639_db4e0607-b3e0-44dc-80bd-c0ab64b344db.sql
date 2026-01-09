-- Create rewards table for items users can exchange
CREATE TABLE public.rewards (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    stock INTEGER DEFAULT 0,
    reward_type TEXT DEFAULT 'steam_account',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create withdrawals/redemptions table
CREATE TABLE public.reward_redemptions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    reward_id UUID REFERENCES public.rewards(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending',
    reward_data TEXT,
    price_paid NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;

-- Rewards policies (public read, admin write)
CREATE POLICY "Rewards are publicly readable" 
ON public.rewards 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert rewards" 
ON public.rewards 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update rewards" 
ON public.rewards 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete rewards" 
ON public.rewards 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'));

-- Redemptions policies
CREATE POLICY "Users can view their own redemptions" 
ON public.reward_redemptions 
FOR SELECT 
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create redemptions" 
ON public.reward_redemptions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update redemptions" 
ON public.reward_redemptions 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_rewards_updated_at
BEFORE UPDATE ON public.rewards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_redemptions_updated_at
BEFORE UPDATE ON public.reward_redemptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();