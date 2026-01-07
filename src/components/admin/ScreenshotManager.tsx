import { useRef } from 'react';
import { ImagePlus, Loader2, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useGameScreenshots, useAddScreenshot, useDeleteScreenshot } from '@/hooks/useGameScreenshots';

interface ScreenshotManagerProps {
  gameId: string;
}

export function ScreenshotManager({ gameId }: ScreenshotManagerProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, isUploading } = useImageUpload();
  
  const { data: screenshots, isLoading } = useGameScreenshots(gameId);
  const addScreenshot = useAddScreenshot();
  const deleteScreenshot = useDeleteScreenshot();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    for (const file of Array.from(files)) {
      const result = await uploadImage(file);
      if (result) {
        await addScreenshot.mutateAsync({ gameId, imageUrl: result.url });
        toast({ title: 'Screenshot uploaded' });
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteScreenshot.mutateAsync({ id, gameId });
      toast({ title: 'Screenshot deleted' });
    } catch {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Screenshots Gallery</h3>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || addScreenshot.isPending}
          className="gap-2"
        >
          {isUploading || addScreenshot.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ImagePlus className="w-4 h-4" />
          )}
          Add Screenshots
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : screenshots?.length ? (
        <div className="grid grid-cols-3 gap-2">
          {screenshots.map((screenshot) => (
            <div
              key={screenshot.id}
              className="relative group aspect-video rounded-md overflow-hidden border border-border/50"
            >
              <img
                src={screenshot.image_url}
                alt="Screenshot"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleDelete(screenshot.id)}
                  disabled={deleteScreenshot.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          No screenshots yet. Upload images to create a gallery.
        </p>
      )}
    </div>
  );
}
