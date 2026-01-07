import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { GameGrid } from '@/components/GameGrid';
import { SearchBar } from '@/components/SearchBar';
import { useGames, useFeaturedGames, useCategories } from '@/hooks/useGames';

export default function Index() {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');

  const { data: games, isLoading } = useGames(searchQuery, category);
  const { data: featuredGames } = useFeaturedGames();
  const { data: categories = [] } = useCategories();

  const showFeatured = !searchQuery && category === 'all' && featuredGames && featuredGames.length > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
          
          <div className="container relative">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h1 className="font-orbitron text-4xl md:text-6xl font-bold mb-4 tracking-tight">
                Your Ultimate
                <span className="text-primary neon-text"> Game Vault</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 font-rajdhani">
                Discover and download the latest games. Fast, secure, and always free.
              </p>
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                category={category}
                onCategoryChange={setCategory}
                categories={categories}
              />
            </div>
          </div>
        </section>

        {/* Featured Games */}
        {showFeatured && (
          <section className="py-12 border-y border-border/50 bg-secondary/20">
            <div className="container">
              <h2 className="font-orbitron text-2xl font-bold mb-6 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-warning" />
                Featured Games
              </h2>
              <GameGrid games={featuredGames} isLoading={false} />
            </div>
          </section>
        )}

        {/* All Games */}
        <section className="py-12">
          <div className="container">
            <h2 className="font-orbitron text-2xl font-bold mb-6">
              {searchQuery || category !== 'all' ? 'Search Results' : 'Latest Uploads'}
            </h2>
            <GameGrid
              games={games}
              isLoading={isLoading}
              emptyMessage={
                searchQuery
                  ? 'No games found matching your search'
                  : 'No games available yet'
              }
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
