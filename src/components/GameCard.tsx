import { Download, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Game } from '@/hooks/useGames';
import { useIncrementDownload } from '@/hooks/useGames';

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  const incrementDownload = useIncrementDownload();

  const handleDownload = async () => {
    await incrementDownload.mutateAsync(game.id);
    window.open(game.download_link, '_blank');
  };

  return (
    <Card className="group overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={game.imgbb_image_url || '/placeholder.svg'}
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {game.is_featured && (
          <Badge className="absolute top-2 left-2 bg-warning text-warning-foreground">
            <Star className="w-3 h-3 mr-1" />
            Featured
          </Badge>
        )}
        {game.category && (
          <Badge variant="secondary" className="absolute top-2 right-2">
            {game.category}
          </Badge>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          {game.title}
        </h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {game.description || 'No description available'}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {game.download_count || 0} downloads
          </span>
          <Button
            size="sm"
            onClick={handleDownload}
            disabled={incrementDownload.isPending}
            className="gap-2 neon-glow"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
