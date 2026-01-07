-- Create table for game screenshots
CREATE TABLE public.game_screenshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.game_screenshots ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Screenshots are publicly readable"
ON public.game_screenshots
FOR SELECT
USING (true);

-- Admin insert
CREATE POLICY "Admins can insert screenshots"
ON public.game_screenshots
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admin update
CREATE POLICY "Admins can update screenshots"
ON public.game_screenshots
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin delete
CREATE POLICY "Admins can delete screenshots"
ON public.game_screenshots
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Index for faster lookups
CREATE INDEX idx_game_screenshots_game_id ON public.game_screenshots(game_id);