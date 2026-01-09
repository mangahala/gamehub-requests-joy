import { useState } from 'react';
import { Gift, Plus, Pencil, Trash2, Loader2, Eye, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RewardFormData {
  title: string;
  description: string;
  image_url: string;
  price: number;
  stock: number;
  reward_type: string;
  is_active: boolean;
}

const defaultFormData: RewardFormData = {
  title: '',
  description: '',
  image_url: '',
  price: 0,
  stock: 1,
  reward_type: 'steam_account',
  is_active: true,
};

export function AdminRewardsTab() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<any>(null);
  const [formData, setFormData] = useState<RewardFormData>(defaultFormData);

  const { data: rewards, isLoading: rewardsLoading } = useQuery({
    queryKey: ['admin-rewards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: redemptions, isLoading: redemptionsLoading } = useQuery({
    queryKey: ['admin-redemptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reward_redemptions')
        .select(`
          *,
          rewards (title)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: profiles } = useQuery({
    queryKey: ['profiles-for-redemptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name');
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: RewardFormData) => {
      if (editingReward) {
        const { error } = await supabase
          .from('rewards')
          .update(data)
          .eq('id', editingReward.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('rewards')
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingReward ? 'Reward updated!' : 'Reward created!');
      queryClient.invalidateQueries({ queryKey: ['admin-rewards'] });
      setDialogOpen(false);
      setEditingReward(null);
      setFormData(defaultFormData);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save reward');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('rewards')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Reward deleted!');
      queryClient.invalidateQueries({ queryKey: ['admin-rewards'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete reward');
    },
  });

  const updateRedemptionMutation = useMutation({
    mutationFn: async ({ id, status, reward_data }: { id: string; status: string; reward_data?: string }) => {
      const { error } = await supabase
        .from('reward_redemptions')
        .update({ status, reward_data })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Redemption updated!');
      queryClient.invalidateQueries({ queryKey: ['admin-redemptions'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update redemption');
    },
  });

  const handleEdit = (reward: any) => {
    setEditingReward(reward);
    setFormData({
      title: reward.title,
      description: reward.description || '',
      image_url: reward.image_url || '',
      price: reward.price,
      stock: reward.stock,
      reward_type: reward.reward_type,
      is_active: reward.is_active,
    });
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingReward(null);
    setFormData(defaultFormData);
    setDialogOpen(true);
  };

  const getProfileName = (userId: string) => {
    const profile = profiles?.find(p => p.user_id === userId);
    return profile?.display_name || userId.slice(0, 8);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="rewards">
        <TabsList>
          <TabsTrigger value="rewards" className="gap-2">
            <Gift className="w-4 h-4" />
            Rewards
          </TabsTrigger>
          <TabsTrigger value="redemptions" className="gap-2">
            <DollarSign className="w-4 h-4" />
            Withdrawals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rewards" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Reward
            </Button>
          </div>

          {rewardsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rewards?.map((reward) => (
                    <TableRow key={reward.id}>
                      <TableCell className="font-medium">{reward.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{reward.reward_type}</Badge>
                      </TableCell>
                      <TableCell>${reward.price}</TableCell>
                      <TableCell>{reward.stock}</TableCell>
                      <TableCell>
                        {reward.is_active ? (
                          <Badge className="bg-green-500">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(reward)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(reward.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!rewards || rewards.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No rewards yet. Add your first reward!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="redemptions" className="space-y-4">
          {redemptionsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Reward</TableHead>
                    <TableHead>Price Paid</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {redemptions?.map((redemption) => (
                    <TableRow key={redemption.id}>
                      <TableCell>{getProfileName(redemption.user_id)}</TableCell>
                      <TableCell>{redemption.rewards?.title || 'Unknown'}</TableCell>
                      <TableCell>${redemption.price_paid}</TableCell>
                      <TableCell>{getStatusBadge(redemption.status || 'pending')}</TableCell>
                      <TableCell>
                        {new Date(redemption.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Select
                          value={redemption.status || 'pending'}
                          onValueChange={(value) =>
                            updateRedemptionMutation.mutate({ id: redemption.id, status: value })
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!redemptions || redemptions.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No redemptions yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingReward ? 'Edit Reward' : 'Add Reward'}</DialogTitle>
            <DialogDescription>
              {editingReward ? 'Update the reward details.' : 'Add a new reward for users to redeem.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Steam Account - GTA V"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Full access Steam account with GTA V installed"
              />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Stock</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div>
              <Label>Reward Type</Label>
              <Select
                value={formData.reward_type}
                onValueChange={(value) => setFormData({ ...formData, reward_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="steam_account">Steam Account</SelectItem>
                  <SelectItem value="game_key">Game Key</SelectItem>
                  <SelectItem value="premium">Premium Access</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => saveMutation.mutate(formData)} disabled={saveMutation.isPending}>
              {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
