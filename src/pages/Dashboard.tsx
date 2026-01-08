import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Copy, Users, DollarSign, Crown, Share2, Gift, ArrowLeft, Loader2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
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
      
      <main className="flex-1 container py-8">
        {/* Back Button */}
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-orbitron font-bold mb-2">
            Welcome, {profile?.display_name || user.email?.split('@')[0]}!
          </h1>
          <p className="text-muted-foreground font-rajdhani">
            Manage your referrals and track your earnings
          </p>
        </div>

        {/* Premium Status */}
        {isPremium && (
          <Card className="mb-6 bg-gradient-to-r from-primary/20 to-purple-500/20 border-primary/30">
            <CardContent className="flex items-center gap-4 py-4">
              <Crown className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="font-orbitron font-bold text-lg">Premium Active</p>
                <p className="text-sm text-muted-foreground font-rajdhani">
                  {premiumDaysLeft} days remaining - Priority game requests enabled!
                </p>
              </div>
              <Badge className="ml-auto bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                PREMIUM
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Referrals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-orbitron font-bold">{stats?.referral_count || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-orbitron font-bold text-green-400">
                ${Number(stats?.total_earnings || 0).toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Gift className="w-4 h-4" />
                Per Referral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-orbitron font-bold">$0.50</p>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-orbitron">
              <Share2 className="w-5 h-5 text-primary" />
              Your Referral Link
            </CardTitle>
            <CardDescription className="font-rajdhani">
              Share this link to earn $0.50 per signup + they get 3 days of premium!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="flex-1 bg-secondary/50 rounded-lg px-4 py-3 font-mono text-sm break-all">
                {referralUrl}
              </div>
              <Button onClick={copyReferralLink} className="gap-2">
                <Copy className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle className="font-orbitron">How to Earn More</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-semibold mb-2">Share Your Link</h3>
                <p className="text-sm text-muted-foreground font-rajdhani">
                  Share your referral link on social media, Discord, or with friends
                </p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <h3 className="font-semibold mb-2">Friends Sign Up</h3>
                <p className="text-sm text-muted-foreground font-rajdhani">
                  When someone signs up using your link, they get 3 days premium
                </p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
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
