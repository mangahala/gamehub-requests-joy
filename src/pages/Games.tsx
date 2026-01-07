import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SearchBar } from '@/components/SearchBar';
import { GameGrid } from '@/components/GameGrid';
import { useGames, useCategories } from '@/hooks/useGames';
import { Gamepad2 } from 'lucide-react';

export default function Games() {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  
  const { data: games, isLoading } = useGames(searchQuery, category === 'all' ? '' : category);
  const { data: categories } = useCategories();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="container relative">
            <div className="flex items-center gap-3 mb-4">
              <Gamepad2 className="w-10 h-10 text-primary" />
              <h1 className="font-orbitron text-3xl md:text-4xl font-bold">
                All <span className="text-primary neon-text">Games</span>
              </h1>
            </div>
            <p className="text-muted-foreground text-lg font-rajdhani max-w-xl mb-6">
              Browse our complete collection of games with screenshots and instant downloads.
            </p>
            
            <SearchBar 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              category={category}
              onCategoryChange={setCategory}
              categories={categories || []}
            />
          </div>
        </section>

        {/* Games Grid */}
        <section className="container pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-orbitron text-xl font-semibold">
              {searchQuery ? 'Search Results' : category && category !== 'all' ? `${category} Games` : 'All Games'}
            </h2>
            {games && (
              <span className="text-sm text-muted-foreground font-rajdhani">
                {games.length} {games.length === 1 ? 'game' : 'games'} found
              </span>
            )}
          </div>
          <GameGrid 
            games={games} 
            isLoading={isLoading} 
            emptyMessage={searchQuery ? 'No games match your search' : 'No games available'}
          />
        </section>
      </main>

      <Footer />
    </div>
  );
}
