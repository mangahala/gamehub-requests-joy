import { useState } from 'react';
import { Gift, Star, ShoppingCart, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function RewardsShop() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: rewards, isLoading } = useQuery({
    queryKey: ['rewards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('total_earnings')
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const redeemMutation = useMutation({
    mutationFn: async (reward: any) => {
      if (!user) throw new Error('Must be logged in');
      
      // Check balance
      const balance = profile?.total_earnings || 0;
      if (balance < reward.price) {
        throw new Error('Insufficient balance');
      }

      // Create redemption
      const { error: redeemError } = await supabase
        .from('reward_redemptions')
        .insert({
          user_id: user.id,
          reward_id: reward.id,
          price_paid: reward.price,
          status: 'pending',
        });
      if (redeemError) throw redeemError;

      // Deduct from balance
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ total_earnings: balance - reward.price })
        .eq('user_id', user.id);
      if (updateError) throw updateError;

      // Update stock
      if (reward.stock > 0) {
        await supabase
          .from('rewards')
          .update({ stock: reward.stock - 1 })
          .eq('id', reward.id);
      }
    },
    onSuccess: () => {
      toast.success('Reward redeemed! Check your dashboard for details.');
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setConfirmOpen(false);
      setSelectedReward(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to redeem reward');
    },
  });

  const handleRedeem = (reward: any) => {
    if (!user) {
      toast.error('Please sign in to redeem rewards');
      return;
    }
    setSelectedReward(reward);
    setConfirmOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <section className="py-12 bg-gradient-to-b from-background to-muted/30">
      <div className="container">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Gift className="w-4 h-4" />
            <span className="text-sm font-medium">Rewards Shop</span>
          </div>
          <h2 className="text-3xl font-bold mb-2">Exchange Your Earnings</h2>
          <p className="text-muted-foreground">
            Redeem your referral earnings for Steam accounts and more!
          </p>
          {user && profile && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 text-green-500">
              <Star className="w-4 h-4" />
              <span className="font-semibold">Your Balance: ${profile.total_earnings?.toFixed(2) || '0.00'}</span>
            </div>
          )}
        </div>

        {!rewards || rewards.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No rewards available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rewards.map((reward) => (
              <Card key={reward.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="aspect-video relative overflow-hidden bg-muted">
                  {reward.image_url ? (
                    <img
                      src={reward.image_url}
                      alt={reward.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Gift className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  {reward.stock !== null && reward.stock <= 5 && reward.stock > 0 && (
                    <Badge className="absolute top-2 right-2 bg-orange-500">
                      Only {reward.stock} left!
                    </Badge>
                  )}
                  {reward.stock === 0 && (
                    <Badge className="absolute top-2 right-2 bg-destructive">
                      Out of stock
                    </Badge>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{reward.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {reward.description || 'Steam account reward'}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">${reward.price}</span>
                  <Button
                    onClick={() => handleRedeem(reward)}
                    disabled={reward.stock === 0}
                    size="sm"
                    className="gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Redeem
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Redemption</DialogTitle>
            <DialogDescription>
              Are you sure you want to redeem "{selectedReward?.title}" for ${selectedReward?.price}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedReward && redeemMutation.mutate(selectedReward)}
              disabled={redeemMutation.isPending}
            >
              {redeemMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
