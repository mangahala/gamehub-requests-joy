import { useState, useEffect } from 'react';
import { Upload, Loader2, Link as LinkIcon } from 'lucide-react';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useCreateGame, useUpdateGame, type Game } from '@/hooks/useGames';

const gameSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  category: z.string().max(100).optional(),
  download_link: z.string().url('Must be a valid URL'),
  imgbb_image_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  is_featured: z.boolean().optional(),
});

interface GameFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  game?: Game;
}

export function GameFormDialog({ open, onOpenChange, game }: GameFormDialogProps) {
  const { toast } = useToast();
  const createGame = useCreateGame();
  const updateGame = useUpdateGame();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [downloadLink, setDownloadLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!game;

  useEffect(() => {
    if (game) {
      setTitle(game.title);
      setDescription(game.description || '');
      setCategory(game.category || '');
      setDownloadLink(game.download_link);
      setImageUrl(game.imgbb_image_url || '');
      setIsFeatured(game.is_featured || false);
    } else {
      setTitle('');
      setDescription('');
      setCategory('');
      setDownloadLink('');
      setImageUrl('');
      setIsFeatured(false);
    }
    setErrors({});
  }, [game, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = gameSchema.safeParse({
      title,
      description: description || undefined,
      category: category || undefined,
      download_link: downloadLink,
      imgbb_image_url: imageUrl || undefined,
      is_featured: isFeatured,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      const gameData = {
        title: title.trim(),
        description: description.trim() || null,
        category: category.trim() || null,
        download_link: downloadLink.trim(),
        imgbb_image_url: imageUrl.trim() || null,
        is_featured: isFeatured,
      };

      if (isEditing) {
        await updateGame.mutateAsync({ id: game.id, ...gameData });
        toast({ title: 'Game updated successfully' });
      } else {
        await createGame.mutateAsync(gameData);
        toast({ title: 'Game created successfully' });
      }

      onOpenChange(false);
    } catch (error) {
      toast({
        title: isEditing ? 'Failed to update game' : 'Failed to create game',
        variant: 'destructive',
      });
    }
  };

  const isPending = createGame.isPending || updateGame.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Game' : 'Add New Game'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Game title"
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Game description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Action, RPG, Strategy"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="download-link">Download Link *</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="download-link"
                value={downloadLink}
                onChange={(e) => setDownloadLink(e.target.value)}
                placeholder="https://..."
                className={`pl-10 ${errors.download_link ? 'border-destructive' : ''}`}
              />
            </div>
            {errors.download_link && (
              <p className="text-sm text-destructive">{errors.download_link}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image-url">Image URL (ImgBB)</Label>
            <div className="relative">
              <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="image-url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://i.ibb.co/..."
                className={`pl-10 ${errors.imgbb_image_url ? 'border-destructive' : ''}`}
              />
            </div>
            {errors.imgbb_image_url && (
              <p className="text-sm text-destructive">{errors.imgbb_image_url}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Upload your image to ImgBB and paste the direct link here
            </p>
          </div>

          {imageUrl && (
            <div className="rounded-lg overflow-hidden border">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-32 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label htmlFor="featured">Featured Game</Label>
            <Switch
              id="featured"
              checked={isFeatured}
              onCheckedChange={setIsFeatured}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Add Game'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
