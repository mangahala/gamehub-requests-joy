import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, Trash2, Clock, CheckCircle, XCircle, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  useGameRequests,
  useUpdateGameRequest,
  useDeleteGameRequest,
  type GameRequest,
} from '@/hooks/useGameRequests';

const statusConfig: Record<string, { label: string; icon: React.ReactNode; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pending', icon: <Clock className="w-3 h-3" />, variant: 'secondary' },
  approved: { label: 'Approved', icon: <CheckCircle className="w-3 h-3" />, variant: 'default' },
  added: { label: 'Added', icon: <Plus className="w-3 h-3" />, variant: 'outline' },
  rejected: { label: 'Rejected', icon: <XCircle className="w-3 h-3" />, variant: 'destructive' },
};

export function AdminRequestsTab() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { data: requests, isLoading } = useGameRequests();
  const updateRequest = useUpdateGameRequest();
  const deleteRequest = useDeleteGameRequest();
  const { toast } = useToast();

  const filteredRequests = requests?.filter(
    (r) => statusFilter === 'all' || r.status === statusFilter
  );

  const handleStatusChange = async (request: GameRequest, status: string) => {
    try {
      await updateRequest.mutateAsync({ id: request.id, status });
      toast({ title: `Request marked as ${status}` });
    } catch (error) {
      toast({ title: 'Failed to update request', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRequest.mutateAsync(id);
      toast({ title: 'Request deleted' });
    } catch (error) {
      toast({ title: 'Failed to delete request', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="added">Added</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!filteredRequests || filteredRequests.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No requests found</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredRequests.map((request) => {
            const status = statusConfig[request.status || 'pending'];
            return (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{request.game_name}</h3>
                        <Badge variant={status.variant} className="gap-1">
                          {status.icon}
                          {status.label}
                        </Badge>
                        {request.platform && (
                          <Badge variant="outline">{request.platform}</Badge>
                        )}
                      </div>
                      {request.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {request.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Requested {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={request.status || 'pending'}
                        onValueChange={(value) => handleStatusChange(request, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="added">Added</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Request</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this request?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(request.id)}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
