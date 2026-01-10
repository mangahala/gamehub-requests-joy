import { useState } from 'react';
import { Gamepad2, MessageSquare, BarChart3, Plus, Gift, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { AdminLayout } from '@/components/AdminLayout';
import { AdminGamesTab } from '@/components/admin/AdminGamesTab';
import { AdminRequestsTab } from '@/components/admin/AdminRequestsTab';
import { AdminStatsTab } from '@/components/admin/AdminStatsTab';
import { AdminRewardsTab } from '@/components/admin/AdminRewardsTab';
import { AdminUsersTab } from '@/components/admin/AdminUsersTab';
import { GameFormDialog } from '@/components/admin/GameFormDialog';

export default function Admin() {
  const [gameDialogOpen, setGameDialogOpen] = useState(false);

  return (
    <AdminLayout>
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 container py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage games, requests, and more</p>
            </div>
            <Button onClick={() => setGameDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Game
            </Button>
          </div>

          <Tabs defaultValue="games" className="space-y-6">
            <TabsList className="flex-wrap h-auto gap-1">
              <TabsTrigger value="games" className="gap-2">
                <Gamepad2 className="w-4 h-4" />
                <span className="hidden sm:inline">Games</span>
              </TabsTrigger>
              <TabsTrigger value="requests" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Requests</span>
              </TabsTrigger>
              <TabsTrigger value="rewards" className="gap-2">
                <Gift className="w-4 h-4" />
                <span className="hidden sm:inline">Rewards</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Stats</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="games">
              <AdminGamesTab onAddGame={() => setGameDialogOpen(true)} />
            </TabsContent>

            <TabsContent value="requests">
              <AdminRequestsTab />
            </TabsContent>

            <TabsContent value="rewards">
              <AdminRewardsTab />
            </TabsContent>

            <TabsContent value="users">
              <AdminUsersTab />
            </TabsContent>

            <TabsContent value="stats">
              <AdminStatsTab />
            </TabsContent>
          </Tabs>
        </main>

        <GameFormDialog open={gameDialogOpen} onOpenChange={setGameDialogOpen} />
      </div>
    </AdminLayout>
  );
}
