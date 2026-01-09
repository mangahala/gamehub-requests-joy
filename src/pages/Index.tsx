import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { GameGrid } from '@/components/GameGrid';
import { SearchBar } from '@/components/SearchBar';
import { HeroCarousel } from '@/components/HeroCarousel';
import { EarnMoneySection } from '@/components/EarnMoneySection';
import { ContentRewardsSection } from '@/components/ContentRewardsSection';
import { Leaderboard } from '@/components/Leaderboard';
import { GlobalChat } from '@/components/GlobalChat';
import { RewardsShop } from '@/components/RewardsShop';
import { SnowEffect } from '@/components/SnowEffect';
import { useGames, useCategories } from '@/hooks/useGames';

export default function Index() {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');

  const { data: games, isLoading } = useGames(searchQuery, category);
  const { data: categories = [] } = useCategories();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Winter Snow Effect */}
      <SnowEffect />
      
      <Header />
      
      <main className="flex-1">
        {/* Hero Carousel */}
        <HeroCarousel />

        {/* Search Section */}
        <section className="py-8 border-b border-border/50">
          <div className="container">
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              category={category}
              onCategoryChange={setCategory}
              categories={categories}
            />
          </div>
        </section>

        {/* All Games */}
        <section className="py-12">
          <div className="container">
            <h2 className="font-orbitron text-2xl font-bold mb-6">
              {searchQuery || category !== 'all' ? 'Search Results' : 'Trending Games'}
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

        {/* Rewards Shop */}
        <RewardsShop />

        {/* Leaderboard */}
        <Leaderboard />

        {/* Earn Money Section */}
        <EarnMoneySection />

        {/* Content Rewards Section */}
        <ContentRewardsSection />
      </main>

      <Footer />

      {/* Global Chat */}
      <GlobalChat />
    </div>
  );
}
