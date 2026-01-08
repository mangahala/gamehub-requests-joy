import { useEffect } from 'react';
import { CheckCircle, Share2, DollarSign, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useIncrementDownload, type Game } from '@/hooks/useGames';
import { toast } from 'sonner';

interface DownloadModalProps {
  game: Game | null;
  onClose: () => void;
}

export function DownloadModal({ game, onClose }: DownloadModalProps) {
  const incrementDownload = useIncrementDownload();

  useEffect(() => {
    if (!game) return;

    // Immediately start download and increment count
    incrementDownload.mutate(game.id);
    window.open(game.download_link, '_blank');
  }, [game]);

  const handleShareLink = () => {
    const shareUrl = `${window.location.origin}/game/${game?.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied! Share it to earn money!');
  };

  if (!game) return null;

  return (
    <Dialog open={!!game} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="sr-only">Download {game.title}</DialogTitle>
        
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
        
        <div className="flex flex-col items-center text-center space-y-6 py-4">
          {/* Game Image */}
          <div className="w-24 h-24 rounded-xl overflow-hidden bg-secondary">
            <img 
              src={game.imgbb_image_url || '/placeholder.svg'} 
              alt={game.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Title */}
          <div>
            <h3 className="font-orbitron text-xl font-bold">{game.title}</h3>
          </div>

          {/* Success Message */}
          <div className="space-y-4 w-full">
            <div className="flex items-center justify-center gap-2 text-green-500">
              <CheckCircle className="w-8 h-8" />
              <span className="font-orbitron text-lg">Download Started!</span>
            </div>

            <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
              <p className="text-sm font-rajdhani text-muted-foreground mb-2">
                Thank you for downloading! 🎮
              </p>
              <p className="text-xs text-muted-foreground">
                Enjoy your game and consider sharing with friends!
              </p>
            </div>

            {/* Share & Earn Section */}
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <span className="font-orbitron text-sm font-bold">Earn Money!</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3 font-rajdhani">
                Share this game link and earn from every download!
              </p>
              <Button 
                onClick={handleShareLink} 
                className="w-full gap-2"
                variant="outline"
              >
                <Share2 className="w-4 h-4" />
                Copy Share Link
              </Button>
            </div>

            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
