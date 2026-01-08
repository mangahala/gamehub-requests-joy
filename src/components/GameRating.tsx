import { useState } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface GameRatingProps {
  gameId: string;
}

export function GameRating({ gameId }: GameRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get average rating
  const { data: stats } = useQuery({
    queryKey: ['game-rating-stats', gameId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('game_ratings')
        .select('rating')
        .eq('game_id', gameId);
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return { average: 0, count: 0 };
      }
      
      const sum = data.reduce((acc, r) => acc + r.rating, 0);
      return { 
        average: sum / data.length, 
        count: data.length 
      };
    },
  });

  // Get user's rating
  const { data: userRating } = useQuery({
    queryKey: ['game-user-rating', gameId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('game_ratings')
        .select('rating')
        .eq('game_id', gameId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data?.rating || null;
    },
    enabled: !!user,
  });

  const rateGame = useMutation({
    mutationFn: async (rating: number) => {
      const { error } = await supabase
        .from('game_ratings')
        .upsert({
          game_id: gameId,
          user_id: user!.id,
          rating,
        }, {
          onConflict: 'game_id,user_id',
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game-rating-stats', gameId] });
      queryClient.invalidateQueries({ queryKey: ['game-user-rating', gameId] });
      toast.success('Rating submitted!');
    },
    onError: () => {
      toast.error('Failed to submit rating');
    },
  });

  const handleRate = (rating: number) => {
    if (!user) {
      toast.error('Please log in to rate games');
      return;
    }
    rateGame.mutate(rating);
  };

  const displayRating = hoverRating || userRating || Math.round(stats?.average || 0);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onMouseEnter={() => user && setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => handleRate(star)}
            className={cn(
              "transition-all",
              user ? "cursor-pointer hover:scale-110" : "cursor-default"
            )}
            disabled={!user}
          >
            <Star
              className={cn(
                "w-6 h-6 transition-colors",
                star <= displayRating
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-transparent text-muted-foreground"
              )}
            />
          </button>
        ))}
      </div>
      <div className="text-sm text-muted-foreground font-rajdhani">
        <span className="font-bold text-foreground">{stats?.average.toFixed(1) || '0.0'}</span>
        <span className="mx-1">•</span>
        <span>{stats?.count || 0} ratings</span>
      </div>
    </div>
  );
}
