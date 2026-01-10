import { Gift, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function DashboardRedemptions() {
  const { user } = useAuth();

  const { data: redemptions, isLoading } = useQuery({
    queryKey: ['user-redemptions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reward_redemptions')
        .select(`
          *,
          rewards (title, image_url, reward_type)
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Completed</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-3d">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-orbitron">
          <Gift className="w-5 h-5 text-primary" />
          My Redemptions
        </CardTitle>
        <CardDescription className="font-rajdhani">
          Track the status of your reward withdrawals
        </CardDescription>
      </CardHeader>
      <CardContent>
        {redemptions && redemptions.length > 0 ? (
          <div className="space-y-4">
            {redemptions.map((redemption) => (
              <div
                key={redemption.id}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border/50 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {redemption.rewards?.image_url ? (
                    <img
                      src={redemption.rewards.image_url}
                      alt={redemption.rewards?.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Gift className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{redemption.rewards?.title || 'Unknown Reward'}</p>
                    <p className="text-sm text-muted-foreground font-rajdhani">
                      {new Date(redemption.created_at).toLocaleDateString()} • ${redemption.price_paid}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(redemption.status || 'pending')}
                  {getStatusBadge(redemption.status || 'pending')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-rajdhani">No redemptions yet. Visit the Rewards Shop to redeem your earnings!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}