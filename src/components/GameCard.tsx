import { Link } from 'react-router-dom';
import { Download, Star, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Game } from '@/hooks/useGames';

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  return (
    <Card className="group overflow-hidden bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={game.imgbb_image_url || '/placeholder.svg'}
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
        {game.is_featured && (
          <Badge className="absolute top-2 left-2 bg-warning text-warning-foreground font-rajdhani">
            <Star className="w-3 h-3 mr-1" />
            Featured
          </Badge>
        )}
        {game.category && (
          <Badge variant="secondary" className="absolute top-2 right-2 font-rajdhani">
            {game.category.split(',')[0]}
          </Badge>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <CardContent className="p-3">
        <h3 className="font-orbitron font-semibold text-sm mb-1 line-clamp-1 group-hover:text-primary transition-colors">
          {game.title}
        </h3>
        <p className="text-muted-foreground text-xs mb-3 line-clamp-2 font-rajdhani">
          {game.description || 'No description available'}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground font-rajdhani">
            <Download className="w-3 h-3" />
            <span className="font-semibold text-foreground">{game.download_count || 0}</span>
          </div>
          <Link to={`/game/${game.id}`}>
            <Button size="sm" className="gap-1.5 neon-glow text-xs h-7 font-rajdhani">
              <Eye className="w-3 h-3" />
              View
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
