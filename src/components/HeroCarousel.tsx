import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFeaturedGames } from '@/hooks/useGames';
import { DownloadModal } from './DownloadModal';
import type { Game } from '@/hooks/useGames';

export function HeroCarousel() {
  const { data: featuredGames = [] } = useFeaturedGames();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [downloadGame, setDownloadGame] = useState<Game | null>(null);

  const goToNext = useCallback(() => {
    if (featuredGames.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % featuredGames.length);
  }, [featuredGames.length]);

  const goToPrev = useCallback(() => {
    if (featuredGames.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + featuredGames.length) % featuredGames.length);
  }, [featuredGames.length]);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (!isAutoPlaying || featuredGames.length <= 1) return;
    
    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, goToNext, featuredGames.length]);

  if (featuredGames.length === 0) {
    return null;
  }

  const currentGame = featuredGames[currentIndex];

  return (
    <>
      <section 
        className="relative w-full h-[500px] md:h-[600px] overflow-hidden"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          {featuredGames.map((game, index) => (
            <div
              key={game.id}
              className={`absolute inset-0 transition-opacity duration-700 ${
                index === currentIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={game.imgbb_image_url || '/placeholder.svg'}
                alt={game.title}
                className="w-full h-full object-cover"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="relative container h-full flex items-center">
          <div className="max-w-xl space-y-6">
            {/* Game Title */}
            <h1 className="font-orbitron text-4xl md:text-6xl font-bold tracking-tight animate-fade-in">
              {currentGame.title}
            </h1>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {currentGame.category && (
                <Badge variant="outline" className="font-rajdhani text-sm px-3 py-1">
                  {currentGame.category}
                </Badge>
              )}
              <Badge className="bg-primary/20 text-primary font-rajdhani">
                PC
              </Badge>
              <Badge variant="secondary" className="font-rajdhani">
                {new Date(currentGame.created_at).getFullYear()}
              </Badge>
            </div>

            {/* Description */}
            <p className="text-muted-foreground text-lg font-rajdhani line-clamp-3">
              {currentGame.description || 'Experience this amazing game now!'}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button 
                size="lg" 
                className="neon-glow gap-2 font-rajdhani text-lg"
                onClick={() => setDownloadGame(currentGame)}
              >
                <Download className="w-5 h-5" />
                Download Now
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2 font-rajdhani text-lg">
                <Link to={`/game/${currentGame.id}`}>
                  <Eye className="w-5 h-5" />
                  View
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {featuredGames.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-20 bottom-8 md:bottom-1/2 md:translate-y-1/2 w-12 h-12 rounded-full bg-background/50 hover:bg-background/80 backdrop-blur-sm"
              onClick={goToPrev}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 bottom-8 md:bottom-1/2 md:translate-y-1/2 w-12 h-12 rounded-full bg-background/50 hover:bg-background/80 backdrop-blur-sm"
              onClick={goToNext}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </>
        )}

        {/* Dots Indicator */}
        {featuredGames.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            {featuredGames.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-primary w-8' 
                    : 'bg-muted-foreground/50 hover:bg-muted-foreground'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Download Modal */}
      <DownloadModal 
        game={downloadGame} 
        onClose={() => setDownloadGame(null)} 
      />
    </>
  );
}
