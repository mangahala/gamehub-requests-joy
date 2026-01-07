import { Loader2 } from 'lucide-react';
import { GameCard } from './GameCard';
import type { Game } from '@/hooks/useGames';

interface GameGridProps {
  games: Game[] | undefined;
  isLoading: boolean;
  emptyMessage?: string;
}

export function GameGrid({ games, isLoading, emptyMessage = 'No games found' }: GameGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!games || games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}
