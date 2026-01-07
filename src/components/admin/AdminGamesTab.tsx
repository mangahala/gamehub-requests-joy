import { useState } from 'react';
import { Search, Edit, Trash2, Star, StarOff, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useGames, useDeleteGame, useUpdateGame, type Game } from '@/hooks/useGames';
import { GameFormDialog } from './GameFormDialog';

interface AdminGamesTabProps {
  onAddGame: () => void;
}

export function AdminGamesTab({ onAddGame }: AdminGamesTabProps) {
  const [search, setSearch] = useState('');
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  
  const { data: games, isLoading } = useGames(search);
  const deleteGame = useDeleteGame();
  const updateGame = useUpdateGame();
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    try {
      await deleteGame.mutateAsync(id);
      toast({ title: 'Game deleted successfully' });
    } catch (error) {
      toast({ title: 'Failed to delete game', variant: 'destructive' });
    }
  };

  const handleToggleFeatured = async (game: Game) => {
    try {
      await updateGame.mutateAsync({
        id: game.id,
        is_featured: !game.is_featured,
        carousel_order: !game.is_featured ? 0 : null,
      });
      toast({
        title: game.is_featured ? 'Game removed from carousel' : 'Game added to carousel',
      });
    } catch (error) {
      toast({ title: 'Failed to update game', variant: 'destructive' });
    }
  };

  const handleCarouselOrderChange = async (game: Game, direction: 'up' | 'down') => {
    const currentOrder = game.carousel_order ?? 0;
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;
    
    try {
      await updateGame.mutateAsync({
        id: game.id,
        carousel_order: Math.max(0, newOrder),
      });
      toast({ title: 'Carousel order updated' });
    } catch (error) {
      toast({ title: 'Failed to update order', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Separate featured games for carousel management
  const featuredGames = games?.filter(g => g.is_featured).sort((a, b) => 
    (a.carousel_order ?? 999) - (b.carousel_order ?? 999)
  ) || [];
  const regularGames = games?.filter(g => !g.is_featured) || [];

  return (
    <div className="space-y-8">
      {/* Carousel Games Section */}
      {featuredGames.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-orbitron font-bold text-lg flex items-center gap-2">
            <Star className="w-5 h-5 text-warning" />
            Hero Carousel Games
          </h3>
          <div className="grid gap-3">
            {featuredGames.map((game, index) => (
              <Card key={game.id} className="overflow-hidden border-warning/30 bg-warning/5">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCarouselOrderChange(game, 'up')}
                        disabled={index === 0 || updateGame.isPending}
                      >
                        <ArrowUp className="w-3 h-3" />
                      </Button>
                      <span className="text-xs text-center font-bold">{index + 1}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCarouselOrderChange(game, 'down')}
                        disabled={index === featuredGames.length - 1 || updateGame.isPending}
                      >
                        <ArrowDown className="w-3 h-3" />
                      </Button>
                    </div>
                    <img
                      src={game.imgbb_image_url || '/placeholder.svg'}
                      alt={game.title}
                      className="w-16 h-10 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate text-sm">{game.title}</h4>
                      <p className="text-xs text-muted-foreground">{game.category}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleFeatured(game)}
                      disabled={updateGame.isPending}
                      className="text-destructive"
                    >
                      <StarOff className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Search and All Games */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search games..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {!games || games.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No games found</p>
            <Button onClick={onAddGame}>Add your first game</Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {(search ? games : regularGames).map((game) => (
              <Card key={game.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={game.imgbb_image_url || '/placeholder.svg'}
                      alt={game.title}
                      className="w-20 h-14 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{game.title}</h3>
                        {game.is_featured && (
                          <Badge variant="secondary" className="bg-warning/20 text-warning">
                            Featured
                          </Badge>
                        )}
                        {game.category && (
                          <Badge variant="outline">{game.category}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {game.description || 'No description'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {game.download_count || 0} downloads
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleFeatured(game)}
                        disabled={updateGame.isPending}
                        title={game.is_featured ? 'Remove from carousel' : 'Add to carousel'}
                      >
                        {game.is_featured ? (
                          <StarOff className="w-4 h-4" />
                        ) : (
                          <Star className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingGame(game)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Game</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{game.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(game.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <GameFormDialog
        open={!!editingGame}
        onOpenChange={(open) => !open && setEditingGame(null)}
        game={editingGame || undefined}
      />
    </div>
  );
}
