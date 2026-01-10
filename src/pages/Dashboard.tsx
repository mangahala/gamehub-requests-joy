import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Copy, Users, DollarSign, Crown, Share2, Gift, ArrowLeft, Loader2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardRedemptions } from '@/components/DashboardRedemptions';
import { DashboardRDP } from '@/components/DashboardRDP';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

interface Profile {
  id: string;
  display_name: string | null;
  referral_code: string;
  premium_until: string | null;
  total_earnings: number;
  is_banned: boolean;
}

interface LeaderboardEntry {
  referral_count: number;
  total_earnings: number;
}

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [copied, setCopied] = useState(false);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user!.id)
        .single();
      
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user,
  });

  const { data: stats } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leaderboard_entries')
        .select('referral_count, total_earnings')
        .eq('user_id', user!.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as LeaderboardEntry | null;
    },
    enabled: !!user,
  });

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground font-rajdhani">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  // Check if user is banned
  if (profile?.is_banned) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8 flex items-center justify-center">
          <Card className="max-w-md text-center">
            <CardContent className="py-12">
              <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🚫</span>
              </div>
              <h2 className="text-2xl font-orbitron font-bold mb-4 text-destructive">Account Suspended</h2>
              <p className="text-muted-foreground font-rajdhani">
                Your account has been suspended. If you believe this is a mistake, 
                please contact support.
              </p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const referralUrl = `${window.location.origin}/auth?ref=${profile?.referral_code}`;
  const isPremium = profile?.premium_until && new Date(profile.premium_until) > new Date();
  const premiumDaysLeft = isPremium 
    ? Math.ceil((new Date(profile.premium_until!).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-4 md:py-8 px-4">
        {/* Back Button */}
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-4 md:mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-orbitron font-bold mb-2 neon-text">
            Welcome, {profile?.display_name || user.email?.split('@')[0]}!
          </h1>
          <p className="text-muted-foreground font-rajdhani text-sm md:text-base">
            Manage your referrals and track your earnings
          </p>
        </div>

        {/* Premium Status */}
        {isPremium && (
          <Card className="mb-6 card-3d bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
            <CardContent className="flex flex-col sm:flex-row items-center gap-4 py-4">
              <Crown className="w-8 h-8 text-yellow-400" />
              <div className="text-center sm:text-left">
                <p className="font-orbitron font-bold text-lg">Premium Active</p>
                <p className="text-sm text-muted-foreground font-rajdhani">
                  {premiumDaysLeft} days remaining - Priority game requests & RDP access enabled!
                </p>
              </div>
              <Badge className="sm:ml-auto bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                PREMIUM
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="card-3d hover:scale-[1.02] transition-transform">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Referrals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl md:text-3xl font-orbitron font-bold">{stats?.referral_count || 0}</p>
            </CardContent>
          </Card>

          <Card className="card-3d hover:scale-[1.02] transition-transform">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl md:text-3xl font-orbitron font-bold text-green-400">
                ${Number(stats?.total_earnings || 0).toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="card-3d hover:scale-[1.02] transition-transform">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Gift className="w-4 h-4" />
                Per Referral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl md:text-3xl font-orbitron font-bold">$0.50</p>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link */}
        <Card className="mb-6 md:mb-8 card-3d">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-orbitron text-lg md:text-xl">
              <Share2 className="w-5 h-5 text-primary" />
              Your Referral Link
            </CardTitle>
            <CardDescription className="font-rajdhani">
              Share this link to earn $0.50 per signup + they get 3 days of premium!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 bg-secondary/50 rounded-lg px-4 py-3 font-mono text-xs md:text-sm break-all border border-border/50">
                {referralUrl}
              </div>
              <Button onClick={copyReferralLink} className="gap-2 neon-glow">
                <Copy className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* RDP Access Section */}
        <div className="mb-6 md:mb-8">
          <DashboardRDP />
        </div>

        {/* Redemptions Section */}
        <div className="mb-6 md:mb-8">
          <DashboardRedemptions />
        </div>

        {/* How It Works */}
        <Card className="card-3d">
          <CardHeader>
            <CardTitle className="font-orbitron">How to Earn More</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="text-center p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3 neon-glow">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-semibold mb-2">Share Your Link</h3>
                <p className="text-sm text-muted-foreground font-rajdhani">
                  Share your referral link on social media, Discord, or with friends
                </p>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3 neon-glow">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <h3 className="font-semibold mb-2">Friends Sign Up</h3>
                <p className="text-sm text-muted-foreground font-rajdhani">
                  When someone signs up using your link, they get 3 days premium
                </p>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3 neon-glow">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <h3 className="font-semibold mb-2">Earn Rewards</h3>
                <p className="text-sm text-muted-foreground font-rajdhani">
                  You earn $0.50 for each successful referral automatically!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}