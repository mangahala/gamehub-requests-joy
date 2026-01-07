-- Add display_order column for hero carousel ordering
ALTER TABLE public.games 
ADD COLUMN carousel_order integer DEFAULT null;

-- Create index for faster carousel queries
CREATE INDEX idx_games_carousel_order ON public.games(carousel_order) WHERE carousel_order IS NOT NULL;