import { Trophy, Medal, Crown, DollarSign, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  referral_count: number;
  total_earnings: number;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

export function Leaderboard() {
  const { data: entries = [] } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leaderboard_entries')
        .select(`
          id,
          user_id,
          referral_count,
          total_earnings,
          profiles!leaderboard_entries_user_id_fkey (
            display_name,
            avatar_url
          )
        `)
        .order('total_earnings', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as unknown as LeaderboardEntry[];
    },
  });

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center font-bold text-muted-foreground">#{index + 1}</span>;
    }
  };

  const getRankBg = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border-yellow-500/30';
      case 1:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-500/10 border-gray-400/30';
      case 2:
        return 'bg-gradient-to-r from-amber-600/20 to-orange-500/10 border-amber-600/30';
      default:
        return 'bg-card/50';
    }
  };

  return (
    <section className="py-16 bg-secondary/30">
      <div className="container">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-4">
            <Trophy className="w-5 h-5 text-primary" />
            <span className="text-primary font-semibold font-rajdhani">Top Earners</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-orbitron font-bold mb-2">
            Creator Leaderboard
          </h2>
          <p className="text-muted-foreground font-rajdhani max-w-2xl mx-auto">
            Top content creators earning by sharing game links and referring new users
          </p>
        </div>

        <Card className="max-w-3xl mx-auto bg-background/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-orbitron">
              <Trophy className="w-5 h-5 text-primary" />
              This Month's Rankings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {entries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-rajdhani">No entries yet. Be the first to earn!</p>
              </div>
            ) : (
              entries.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-all hover:scale-[1.02] ${getRankBg(index)}`}
                >
                  <div className="flex-shrink-0">
                    {getRankIcon(index)}
                  </div>
                  
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary/20 text-primary font-bold">
                      {(entry.profiles?.display_name || 'U')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold font-rajdhani truncate">
                      {entry.profiles?.display_name || 'Anonymous'}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-3 h-3" />
                      <span>{entry.referral_count} referrals</span>
                    </div>
                  </div>
                  
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 font-rajdhani">
                    <DollarSign className="w-3 h-3 mr-1" />
                    {Number(entry.total_earnings).toFixed(2)}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
