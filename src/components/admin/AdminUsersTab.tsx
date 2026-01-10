import { useState } from 'react';
import { Users, Ban, Send, Server, Loader2, Shield, ShieldOff } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RDPFormData {
  ip_address: string;
  username: string;
  password: string;
  notes: string;
}

const defaultRDPForm: RDPFormData = {
  ip_address: '',
  username: '',
  password: '',
  notes: '',
};

export function AdminUsersTab() {
  const queryClient = useQueryClient();
  const [rdpDialogOpen, setRdpDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [rdpForm, setRdpForm] = useState<RDPFormData>(defaultRDPForm);

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['admin-all-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: rdpCredentials } = useQuery({
    queryKey: ['admin-rdp-credentials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rdp_credentials')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  const banMutation = useMutation({
    mutationFn: async ({ userId, isBanned }: { userId: string; isBanned: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: isBanned })
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: (_, { isBanned }) => {
      toast.success(isBanned ? 'User banned!' : 'User unbanned!');
      queryClient.invalidateQueries({ queryKey: ['admin-all-profiles'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update user');
    },
  });

  const rdpMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: RDPFormData }) => {
      // Check if user already has RDP credentials
      const existingRDP = rdpCredentials?.find(r => r.user_id === userId);
      
      if (existingRDP) {
        const { error } = await supabase
          .from('rdp_credentials')
          .update({
            ip_address: data.ip_address,
            username: data.username,
            password: data.password,
            notes: data.notes,
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('rdp_credentials')
          .insert({
            user_id: userId,
            ip_address: data.ip_address,
            username: data.username,
            password: data.password,
            notes: data.notes,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success('RDP credentials sent!');
      queryClient.invalidateQueries({ queryKey: ['admin-rdp-credentials'] });
      setRdpDialogOpen(false);
      setSelectedUserId(null);
      setRdpForm(defaultRDPForm);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send RDP credentials');
    },
  });

  const openRDPDialog = (userId: string) => {
    const existingRDP = rdpCredentials?.find(r => r.user_id === userId);
    if (existingRDP) {
      setRdpForm({
        ip_address: existingRDP.ip_address,
        username: existingRDP.username,
        password: existingRDP.password,
        notes: existingRDP.notes || '',
      });
    } else {
      setRdpForm(defaultRDPForm);
    }
    setSelectedUserId(userId);
    setRdpDialogOpen(true);
  };

  const isPremium = (premiumUntil: string | null) => {
    return premiumUntil && new Date(premiumUntil) > new Date();
  };

  const hasRDP = (userId: string) => {
    return rdpCredentials?.some(r => r.user_id === userId && r.is_active);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users" className="gap-2">
            <Users className="w-4 h-4" />
            All Users
          </TabsTrigger>
          <TabsTrigger value="rdp" className="gap-2">
            <Server className="w-4 h-4" />
            RDP Assignments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Display Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Premium</TableHead>
                    <TableHead>Referral Code</TableHead>
                    <TableHead>Earnings</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles?.map((profile) => (
                    <TableRow key={profile.id} className={profile.is_banned ? 'opacity-50' : ''}>
                      <TableCell className="font-medium">
                        {profile.display_name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        {profile.is_banned ? (
                          <Badge variant="destructive">Banned</Badge>
                        ) : (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {isPremium(profile.premium_until) ? (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Premium</Badge>
                        ) : (
                          <Badge variant="outline">Free</Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{profile.referral_code}</TableCell>
                      <TableCell className="text-green-400">${Number(profile.total_earnings || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        {new Date(profile.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        {isPremium(profile.premium_until) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openRDPDialog(profile.user_id)}
                            title="Send RDP Credentials"
                          >
                            <Server className={`w-4 h-4 ${hasRDP(profile.user_id) ? 'text-green-400' : ''}`} />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => banMutation.mutate({ 
                            userId: profile.user_id, 
                            isBanned: !profile.is_banned 
                          })}
                          title={profile.is_banned ? 'Unban User' : 'Ban User'}
                        >
                          {profile.is_banned ? (
                            <ShieldOff className="w-4 h-4 text-green-400" />
                          ) : (
                            <Ban className="w-4 h-4 text-destructive" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!profiles || profiles.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No users registered yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rdp" className="space-y-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rdpCredentials?.map((rdp) => {
                  const profile = profiles?.find(p => p.user_id === rdp.user_id);
                  return (
                    <TableRow key={rdp.id}>
                      <TableCell className="font-medium">{profile?.display_name || 'Unknown'}</TableCell>
                      <TableCell className="font-mono">{rdp.ip_address}</TableCell>
                      <TableCell className="font-mono">{rdp.username}</TableCell>
                      <TableCell className="font-mono">{rdp.password}</TableCell>
                      <TableCell className="max-w-32 truncate">{rdp.notes || '-'}</TableCell>
                      <TableCell>
                        {rdp.is_active ? (
                          <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>{new Date(rdp.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  );
                })}
                {(!rdpCredentials || rdpCredentials.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No RDP credentials assigned yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={rdpDialogOpen} onOpenChange={setRdpDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              Send RDP Credentials
            </DialogTitle>
            <DialogDescription>
              Send RDP server credentials to this premium user.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>IP Address</Label>
              <Input
                value={rdpForm.ip_address}
                onChange={(e) => setRdpForm({ ...rdpForm, ip_address: e.target.value })}
                placeholder="192.168.1.100 or server.example.com"
              />
            </div>
            <div>
              <Label>Username</Label>
              <Input
                value={rdpForm.username}
                onChange={(e) => setRdpForm({ ...rdpForm, username: e.target.value })}
                placeholder="Administrator"
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="text"
                value={rdpForm.password}
                onChange={(e) => setRdpForm({ ...rdpForm, password: e.target.value })}
                placeholder="SecurePassword123"
              />
            </div>
            <div>
              <Label>Notes (Optional)</Label>
              <Textarea
                value={rdpForm.notes}
                onChange={(e) => setRdpForm({ ...rdpForm, notes: e.target.value })}
                placeholder="Additional instructions..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRdpDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedUserId && rdpMutation.mutate({ userId: selectedUserId, data: rdpForm })}
              disabled={rdpMutation.isPending || !rdpForm.ip_address || !rdpForm.username || !rdpForm.password}
              className="gap-2"
            >
              {rdpMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              <Send className="w-4 h-4" />
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}