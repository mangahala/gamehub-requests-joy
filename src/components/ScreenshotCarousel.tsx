import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { GameScreenshot } from '@/hooks/useGameScreenshots';

interface ScreenshotCarouselProps {
  mainImage?: string | null;
  screenshots: GameScreenshot[];
  title: string;
}

export function ScreenshotCarousel({ mainImage, screenshots, title }: ScreenshotCarouselProps) {
  // Combine main image with screenshots
  const allImages = [
    ...(mainImage ? [{ id: 'main', image_url: mainImage }] : []),
    ...screenshots,
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  if (allImages.length === 0) {
    return (
      <div className="aspect-video rounded-xl border border-border/50 bg-card flex items-center justify-center">
        <img src="/placeholder.svg" alt={title} className="w-full h-full object-cover rounded-xl" />
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="relative group aspect-video overflow-hidden rounded-xl border border-border/50 bg-card">
        <img
          src={allImages[currentIndex].image_url}
          alt={`${title} screenshot ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
        
        {/* Navigation Arrows */}
        {allImages.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-10 w-10 bg-background/80 backdrop-blur-sm"
              onClick={goToPrevious}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-10 w-10 bg-background/80 backdrop-blur-sm"
              onClick={goToNext}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        {allImages.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-rajdhani">
            {currentIndex + 1} / {allImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "flex-shrink-0 w-20 h-14 rounded-md overflow-hidden border-2 transition-all",
                index === currentIndex
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border/50 hover:border-border opacity-70 hover:opacity-100"
              )}
            >
              <img
                src={image.image_url}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
