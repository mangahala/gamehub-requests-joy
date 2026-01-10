import { Server, Copy, Eye, EyeOff, Crown, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function DashboardRDP() {
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const { data: rdpCredentials, isLoading } = useQuery({
    queryKey: ['user-rdp', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rdp_credentials')
        .select('*')
        .eq('user_id', user!.id)
        .eq('is_active', true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: profile } = useQuery({
    queryKey: ['user-profile-premium', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('premium_until')
        .eq('user_id', user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const isPremium = profile?.premium_until && new Date(profile.premium_until) > new Date();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
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

  if (!isPremium) {
    return (
      <Card className="card-3d bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-orbitron">
            <Server className="w-5 h-5 text-primary" />
            RDP Server Access
            <Badge className="ml-2 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Premium Only</Badge>
          </CardTitle>
          <CardDescription className="font-rajdhani">
            Get dedicated RDP server access with premium membership
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Crown className="w-16 h-16 mx-auto mb-4 text-yellow-400 opacity-50" />
            <p className="text-muted-foreground font-rajdhani mb-4">
              RDP server access is available for premium members only. 
              Refer friends to earn premium access!
            </p>
            <Badge variant="outline" className="text-lg px-4 py-2">
              Refer 1 friend = 3 days premium
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!rdpCredentials) {
    return (
      <Card className="card-3d bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-orbitron">
            <Server className="w-5 h-5 text-green-400" />
            RDP Server Access
            <Badge className="ml-2 bg-green-500/20 text-green-400 border-green-500/30">Premium</Badge>
          </CardTitle>
          <CardDescription className="font-rajdhani">
            Your RDP credentials will appear here once assigned by admin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Server className="w-16 h-16 mx-auto mb-4 text-green-400 opacity-50 animate-pulse" />
            <p className="text-muted-foreground font-rajdhani">
              Your RDP server is being set up. Please check back later!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-3d bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-orbitron">
          <Server className="w-5 h-5 text-green-400" />
          RDP Server Access
          <Badge className="ml-2 bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
        </CardTitle>
        <CardDescription className="font-rajdhani">
          Your dedicated RDP server credentials
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="p-4 rounded-lg bg-background/50 border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-rajdhani">IP Address / Hostname</p>
                <p className="font-mono text-lg">{rdpCredentials.ip_address}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(rdpCredentials.ip_address, 'IP Address')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-background/50 border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-rajdhani">Username</p>
                <p className="font-mono text-lg">{rdpCredentials.username}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(rdpCredentials.username, 'Username')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-background/50 border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-rajdhani">Password</p>
                <p className="font-mono text-lg">
                  {showPassword ? rdpCredentials.password : '••••••••••••'}
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(rdpCredentials.password, 'Password')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {rdpCredentials.notes && (
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <p className="text-sm text-yellow-400 font-rajdhani">
                <strong>Note:</strong> {rdpCredentials.notes}
              </p>
            </div>
          )}
        </div>

        <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
          <p className="text-sm text-primary font-rajdhani">
            <strong>How to connect:</strong> Open Remote Desktop Connection (mstsc.exe on Windows), 
            enter the IP address, and use the username/password provided above.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}