import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type GameRequest = Tables<'game_requests'>;
export type GameRequestInsert = TablesInsert<'game_requests'>;
export type GameRequestUpdate = TablesUpdate<'game_requests'>;

export function useGameRequests() {
  return useQuery({
    queryKey: ['game_requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('game_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as GameRequest[];
    },
  });
}

export function useCreateGameRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: GameRequestInsert) => {
      const { data, error } = await supabase
        .from('game_requests')
        .insert(request)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game_requests'] });
    },
  });
}

export function useUpdateGameRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: GameRequestUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('game_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game_requests'] });
    },
  });
}

export function useDeleteGameRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('game_requests').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game_requests'] });
    },
  });
}
