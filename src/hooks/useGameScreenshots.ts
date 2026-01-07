import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface GameScreenshot {
  id: string;
  game_id: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

export function useGameScreenshots(gameId: string | undefined) {
  return useQuery({
    queryKey: ['game-screenshots', gameId],
    queryFn: async () => {
      if (!gameId) return [];
      const { data, error } = await supabase
        .from('game_screenshots')
        .select('*')
        .eq('game_id', gameId)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as GameScreenshot[];
    },
    enabled: !!gameId,
  });
}

export function useAddScreenshot() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ gameId, imageUrl }: { gameId: string; imageUrl: string }) => {
      // Get current max order
      const { data: existing } = await supabase
        .from('game_screenshots')
        .select('display_order')
        .eq('game_id', gameId)
        .order('display_order', { ascending: false })
        .limit(1);
      
      const nextOrder = (existing?.[0]?.display_order ?? -1) + 1;
      
      const { data, error } = await supabase
        .from('game_screenshots')
        .insert({ game_id: gameId, image_url: imageUrl, display_order: nextOrder })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['game-screenshots', variables.gameId] });
    },
  });
}

export function useDeleteScreenshot() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, gameId }: { id: string; gameId: string }) => {
      const { error } = await supabase
        .from('game_screenshots')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { id, gameId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['game-screenshots', result.gameId] });
    },
  });
}
