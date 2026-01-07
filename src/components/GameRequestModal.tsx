import { useState } from 'react';
import { Gamepad2, Send, Loader2 } from 'lucide-react';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useCreateGameRequest } from '@/hooks/useGameRequests';

const requestSchema = z.object({
  game_name: z.string().min(1, 'Game name is required').max(200, 'Game name is too long'),
  description: z.string().max(1000, 'Description is too long').optional(),
  platform: z.string().max(100, 'Platform is too long').optional(),
});

export function GameRequestModal() {
  const [open, setOpen] = useState(false);
  const [gameName, setGameName] = useState('');
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { toast } = useToast();
  const createRequest = useCreateGameRequest();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = requestSchema.safeParse({
      game_name: gameName,
      description: description || undefined,
      platform: platform || undefined,
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
      await createRequest.mutateAsync({
        game_name: gameName.trim(),
        description: description.trim() || null,
        platform: platform.trim() || null,
      });

      toast({
        title: 'Request submitted!',
        description: 'Thank you for your game request. We\'ll review it soon.',
      });

      setGameName('');
      setDescription('');
      setPlatform('');
      setOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit request. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-primary/50 hover:border-primary hover:bg-primary/10">
          <Gamepad2 className="w-4 h-4" />
          Request a Game
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-primary" />
            Request a Game
          </DialogTitle>
          <DialogDescription>
            Can't find a game? Let us know and we'll try to add it!
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="game-name">Game Name *</Label>
            <Input
              id="game-name"
              placeholder="Enter the game name"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              className={errors.game_name ? 'border-destructive' : ''}
            />
            {errors.game_name && (
              <p className="text-sm text-destructive">{errors.game_name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="platform">Platform (optional)</Label>
            <Input
              id="platform"
              placeholder="e.g., PC, PlayStation, Xbox"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className={errors.platform ? 'border-destructive' : ''}
            />
            {errors.platform && (
              <p className="text-sm text-destructive">{errors.platform}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Additional Details (optional)</Label>
            <Textarea
              id="description"
              placeholder="Version, edition, or any other details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={errors.description ? 'border-destructive' : ''}
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>
          <Button 
            type="submit" 
            className="w-full gap-2"
            disabled={createRequest.isPending}
          >
            {createRequest.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Submit Request
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
