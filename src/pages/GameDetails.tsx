import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Star, Calendar, Loader2, CheckCircle } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScreenshotCarousel } from '@/components/ScreenshotCarousel';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useIncrementDownload } from '@/hooks/useGames';
import { useGameScreenshots } from '@/hooks/useGameScreenshots';
import type { Game } from '@/hooks/useGames';

export default function GameDetails() {
  const { id } = useParams<{ id: string }>();
  const incrementDownload = useIncrementDownload();
  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'complete'>('idle');

  const { data: game, isLoading } = useQuery({
    queryKey: ['game', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data as Game;
    },
    enabled: !!id,
  });

  const { data: screenshots = [] } = useGameScreenshots(id);

  const handleDownload = async () => {
    if (!game || downloadState !== 'idle') return;
    
    setDownloadState('downloading');
    
    await incrementDownload.mutateAsync(game.id);
    
    // Simulate download animation
    setTimeout(() => {
      setDownloadState('complete');
      window.open(game.download_link, '_blank');
      
      // Reset after animation
      setTimeout(() => {
        setDownloadState('idle');
      }, 2000);
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold">Game not found</h1>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Back Button */}
        <div className="container py-6">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Games
            </Button>
          </Link>
        </div>

        {/* Game Hero */}
        <section className="container pb-12">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Screenshot Carousel */}
            <div className="relative">
              <ScreenshotCarousel 
                mainImage={game.imgbb_image_url} 
                screenshots={screenshots} 
                title={game.title} 
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2 z-10">
                {game.is_featured && (
                  <Badge className="bg-warning text-warning-foreground font-rajdhani">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
                {game.category && (
                  <Badge variant="secondary" className="font-rajdhani">{game.category}</Badge>
                )}
              </div>
            </div>

            {/* Game Info */}
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl md:text-4xl font-orbitron font-bold mb-4">{game.title}</h1>
              
              <p className="text-muted-foreground text-lg mb-6 font-rajdhani">
                {game.description || 'No description available for this game.'}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-4 py-2 rounded-lg">
                  <Download className="w-4 h-4" />
                  <span className="font-semibold text-foreground">{game.download_count || 0}</span>
                  <span>Downloads</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-4 py-2 rounded-lg">
                  <Calendar className="w-4 h-4" />
                  <span>Added {new Date(game.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Download Button with Animation */}
              <Button
                size="lg"
                onClick={handleDownload}
                disabled={downloadState !== 'idle'}
                className={`
                  relative overflow-hidden w-full sm:w-auto min-w-[200px] h-14 text-lg font-semibold
                  transition-all duration-300
                  ${downloadState === 'complete' ? 'bg-green-600 hover:bg-green-600' : 'neon-glow'}
                `}
              >
                {/* Background animation */}
                {downloadState === 'downloading' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary animate-pulse" />
                )}
                
                {/* Content */}
                <span className="relative flex items-center gap-2">
                  {downloadState === 'idle' && (
                    <>
                      <Download className="w-5 h-5" />
                      Download Now
                    </>
                  )}
                  {downloadState === 'downloading' && (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Preparing Download...
                    </>
                  )}
                  {downloadState === 'complete' && (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Download Started!
                    </>
                  )}
                </span>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
