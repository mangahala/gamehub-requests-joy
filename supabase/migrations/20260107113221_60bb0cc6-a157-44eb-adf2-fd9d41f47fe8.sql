-- Create app_role enum for admin roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
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

-- Create games table
CREATE TABLE public.games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'General',
    imgbb_image_url TEXT,
    download_link TEXT NOT NULL,
    download_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on games
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Games are publicly readable
CREATE POLICY "Games are publicly readable"
ON public.games
FOR SELECT
USING (true);

-- Only admins can insert games
CREATE POLICY "Admins can insert games"
ON public.games
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update games
CREATE POLICY "Admins can update games"
ON public.games
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete games
CREATE POLICY "Admins can delete games"
ON public.games
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create game_requests table
CREATE TABLE public.game_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_name TEXT NOT NULL,
    description TEXT,
    platform TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'added', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on game_requests
ALTER TABLE public.game_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can insert game requests (no auth required)
CREATE POLICY "Anyone can insert game requests"
ON public.game_requests
FOR INSERT
WITH CHECK (true);

-- Only admins can view game requests
CREATE POLICY "Admins can view game requests"
ON public.game_requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can update game requests
CREATE POLICY "Admins can update game requests"
ON public.game_requests
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete game requests
CREATE POLICY "Admins can delete game requests"
ON public.game_requests
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS for user_roles - only admins can view/manage
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for games updated_at
CREATE TRIGGER update_games_updated_at
BEFORE UPDATE ON public.games
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to increment download count
CREATE OR REPLACE FUNCTION public.increment_download_count(game_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.games
    SET download_count = download_count + 1
    WHERE id = game_id;
END;
$$;